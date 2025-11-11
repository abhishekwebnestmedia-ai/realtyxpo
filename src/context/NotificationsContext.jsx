import React, { createContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import api from '../api/api';

const NotificationsContext = createContext(null);

const resolveWsUrl = () => {
  if (import.meta.env.VITE_WS_URL) return import.meta.env.VITE_WS_URL;
  const apiBase = api?.defaults?.baseURL;
  if (apiBase) {
    try {
      return new URL(apiBase).origin;
    } catch {
      return apiBase;
    }
  }
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return 'http://localhost:5000';
};

export const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);
  const lastFetchedAtRef = useRef(null);
  const handlerRef = useRef(null);

  // load audio from public folder
  useEffect(() => {
    audioRef.current = new Audio('/notification.mp3');
    audioRef.current.preload = 'auto';
  }, []);

  // helper to unlock audio playback after a user gesture
  const unlockAudio = async () => {
    try {
      const audio = audioRef.current;
      if (!audio) return;
      // Try muted play trick to unlock playback in some browsers
      audio.muted = true;
      await audio.play().catch(() => {});
      audio.pause();
      audio.muted = false;
      // reset currentTime so subsequent plays start from 0
      audio.currentTime = 0;
      return true;
    } catch (err) {
      console.debug('unlockAudio failed', err);
      return false;
    }
  };

  const getCurrentUserId = () => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1] || ''));
        return payload?.userId || payload?._id || payload?.id || null;
      }
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      return user?._id || user?.userId || user?.id || null;
    } catch (err) {
      console.debug('Failed to decode user id for notifications', err);
      return null;
    }
  };

  // fetch initial list
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const resp = await api.get('/notifications');
        const list = resp.data?.data || resp.data || [];
        if (!mounted) return;
        // normalize createdAt and ids
        const normalized = list.map((n) => ({
          notificationId: n._id || n.notificationId,
          ...n,
        }));
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(normalized);
        setUnreadCount(normalized.filter(n => !n.isRead).length);
        if (normalized.length) lastFetchedAtRef.current = normalized[0].createdAt;
      } catch (err) {
        console.error('Failed to fetch notifications', err);
      }
    })();
    return () => { mounted = false; };
  }, []);

  

  // connect socket.io and fallback polling
  useEffect(() => {
    const token = localStorage.getItem('token');
    // create socket
    try {
      const wsUrl = resolveWsUrl();
      socketRef.current = io(wsUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
        withCredentials: true
      });

      const onConnect = () => {
        console.debug('Notifications: socket connected', socketRef.current.id);
        // socket connected
        // stop polling when connected
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        const userId = getCurrentUserId();
        if (userId) {
          socketRef.current.emit('register_user', userId);
          socketRef.current.emit('subscribe_notifications', userId);
        }
        // one-time sync after connect to avoid missing notifications during the transition
        (async () => {
          try {
            const since = lastFetchedAtRef.current;
            const url = since ? `/notifications?since=${encodeURIComponent(since)}` : '/notifications';
            const resp = await api.get(url);
            const list = resp.data?.data || resp.data || [];
            if (Array.isArray(list) && list.length) {
              list.forEach(p => handlerRef.current?.(p));
            }
          } catch { /* one-off sync failed, ignore */ }
        })();
      };

      socketRef.current.on('connect', onConnect);
      socketRef.current.on('registered_success', (payload) => {
        console.debug('Notifications: registered_success', payload);
      });

      socketRef.current.on('notification', (payload) => {
        console.debug('Notifications: received event "notification"', payload);
        handlerRef.current?.(payload);
      });

      socketRef.current.on('notification_received', (payload) => {
        console.debug('Notifications: received event "notification_received"', payload);
        handlerRef.current?.(payload);
      });

      // Temporary: also listen for legacy/cron event name so client receives follow-up emits
      // emitted by older server code (followup_notification). Remove after server uses
      // the standardized 'notification' event name.
      socketRef.current.on('followup_notification', (payload) => {
        console.debug('Notifications: received event "followup_notification"', payload);
        handlerRef.current?.(payload);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('socket disconnected', reason);
        // start polling fallback
        if (!pollingRef.current) startPolling();
      });
    } catch (err) {
      console.error('Socket init failed', err);
      startPolling();
    }

    // cleanup
    return () => {
      if (socketRef.current) {
        socketRef.current.off('connect');
        socketRef.current.off('registered_success');
        socketRef.current.off('notification');
        socketRef.current.off('notification_received');
        socketRef.current.off('followup_notification');
        socketRef.current.off('disconnect');
        socketRef.current?.disconnect();
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, []);

  const startPolling = (interval = 20000) => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        const since = lastFetchedAtRef.current; // ISO string
        const url = since ? `/notifications?since=${encodeURIComponent(since)}` : '/notifications';
        const resp = await api.get(url);
        const list = resp.data?.data || resp.data || [];
        if (Array.isArray(list) && list.length) {
          list.forEach(p => handlerRef.current?.(p));
        }
      } catch (err) {
        console.error('Polling notifications failed', err);
      }
    }, interval);
  };

  const handleIncomingNotification = (payload) => {
    const n = {
      notificationId: payload._id || payload.notificationId || payload.id,
      createdAt: payload.createdAt || new Date().toISOString(),
      ...payload,
    };

    

    setNotifications(prev => {
      // dedupe by id
      const existing = n.notificationId && prev.some(p => (p.notificationId || p._id) === n.notificationId);
      if (existing) {
        // still update lastFetchedAtRef if incoming is newer
        try {
          const top = prev[0];
          const topTime = top ? new Date(top.createdAt).getTime() : 0;
          const incomingTime = new Date(n.createdAt).getTime();
          if (incomingTime > topTime) lastFetchedAtRef.current = n.createdAt;
  } catch { /* ignore */ }
        // recompute unread count from existing array
        setUnreadCount(prev.filter(x => !x.isRead).length);
        return prev;
      }

      const next = [n, ...prev];
      // update last fetched
      lastFetchedAtRef.current = next[0]?.createdAt || lastFetchedAtRef.current;
      // recompute unread count from new state
      setUnreadCount(next.filter(x => !x.isRead).length);
      return next;
    });

    // try to play sound (may be blocked until user interaction)
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch((e) => console.debug('audio play blocked', e));
      }
    } catch (err) {
      console.debug('audio error', err);
    }

    // show desktop notification if permitted
    try {
      if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
        const title = payload.type ? `${payload.type} update` : 'Notification';
        const notif = new Notification(title, {
          body: payload.message || '',
          tag: n.notificationId || n._id,
          renotify: true
        });
        notif.onclick = () => {
          try { window.focus(); } catch { console.debug('window focus blocked'); }
          // open panel as user clicked the notification
          setIsPanelOpen(true);
        };
      }
    } catch (err) {
      console.debug('desktop notification failed', err);
    }
  };

  // ensure the ref always points to the latest handler (avoids stale closures)
  handlerRef.current = handleIncomingNotification;

  // (dev helper removed)

  const markAsRead = async (id) => {
    try {
      setNotifications(prev => {
        const next = prev.map(n => (n.notificationId === id || n._id === id) ? { ...n, isRead: true } : n);
        setUnreadCount(next.filter(x => !x.isRead).length);
        return next;
      });
      await api.post(`/notifications/${id}/read`);
    } catch (err) {
      console.error('markAsRead failed', err);
    }
  };

  const markAllRead = async () => {
    try {
      setNotifications(prev => {
        const next = prev.map(n => ({ ...n, isRead: true }));
        setUnreadCount(0);
        return next;
      });
      await api.post('/notifications/read-all');
    } catch (err) {
      console.error('markAllRead failed', err);
    }
  };

  const openPanel = () => {
    // a user gesture — unlock audio and request desktop permission if needed
    unlockAudio().catch(() => {});
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default') {
      // Ask for permission but don't block
      Notification.requestPermission().catch(() => {});
    }
    setIsPanelOpen(true);
  };

  const closePanel = () => setIsPanelOpen(false);

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      isPanelOpen,
      openPanel,
      closePanel,
      markAsRead,
      markAllRead,
      setNotifications
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
