import React, { createContext, useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import api from '../api/api';
import { parseLocalTimestamp } from '../utils/datetime';

const NotificationsContext = createContext(null);

const computeClientTimestamp = (raw) => {
  const t = parseLocalTimestamp(raw);
  return t == null ? Date.now() : t;
};

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
  const [followupReminder, setFollowupReminder] = useState(null); // { notification, nextShowAt: null }
  const [isRinging, setIsRinging] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);
  const followupQueueRef = useRef([]);
  const followupTimersRef = useRef({});
  const lastFetchedAtRef = useRef(null);
  const handlerRef = useRef(null);

  // load audio from public folder
  useEffect(() => {
    // use the project's followup sound (exists in public/)
    audioRef.current = new Audio('/FollowupBell.mp3');
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
    } catch {
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
    } catch {
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
        // normalize createdAt and ids; compute _clientTs for each item
        const normalized = (list || []).map((n) => ({
          notificationId: n._id || n.notificationId,
          _clientTs: computeClientTimestamp(n.createdAt || n.createdAtISO || n.date || n.followUp || n.followUpDate),
          ...n,
        }));
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        // sort by client timestamp (newest first)
        normalized.sort((a, b) => (b._clientTs || 0) - (a._clientTs || 0));
        setNotifications(normalized);
        setUnreadCount(normalized.filter(n => !n.isRead).length);
        if (normalized.length) {
          const top = normalized[0];
          lastFetchedAtRef.current = top.createdAt || new Date(top._clientTs).toISOString();
        }
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
          } catch (err) { console.error('one-off sync failed', err); }
        })();
      };

      socketRef.current.on('connect', onConnect);
      socketRef.current.on('registered_success', () => {});

      socketRef.current.on('notification', (payload) => {
        try { payload.__event = 'notification'; } catch { /* ignore */ }
        handlerRef.current?.(payload);
      });

      socketRef.current.on('notification_received', (payload) => {
        try { payload.__event = 'notification_received'; } catch { /* ignore */ }
        handlerRef.current?.(payload);
      });

      // Temporary: also listen for legacy/cron event name so client receives follow-up emits
      // emitted by older server code (followup_notification). Remove after server uses
      // the standardized 'notification' event name.
      socketRef.current.on('followup_notification', (payload) => {
        try { payload.__event = 'followup_notification'; } catch { /* ignore */ }
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

  const isLikelyFollowup = (payload) => {
    try {
      if (!payload || typeof payload !== 'object') return false;
      if (payload.__event === 'followup_notification') return true;
      const type = (payload.type || payload.category || payload.kind || '').toString().toLowerCase();
      if (type.includes('follow')) return true;
      const keys = Object.keys(payload).map(k => k.toLowerCase());
      if (keys.some(k => k.includes('follow'))) {
        // any field with 'follow' and a truthy value
        if (keys.some(k => k.includes('follow') && payload[k] != null && payload[k] !== '')) return true;
      }
      const msg = (payload.message || '').toString().toLowerCase();
      if (msg.includes('follow up') || msg.includes('follow-up') || msg.includes('followup')) return true;
      return false;
    } catch { return false; }
  };

  const handleIncomingNotification = (payload) => {
    // incoming payload received
    const n = {
      notificationId: payload._id || payload.notificationId || payload.id,
      createdAt: payload.createdAt || new Date().toISOString(),
      _clientTs: computeClientTimestamp(payload.createdAt || payload.createdAtISO || payload.date || payload.followUp || payload.followUpDate),
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

      const next = [n, ...prev]
        .reduce((acc, item) => {
          if (!item) return acc;
          // avoid duplicates when both new item and existing share id but existing check missed (e.g. missing id)
          const id = item.notificationId || item._id;
          if (id && acc.some(x => (x.notificationId || x._id) === id)) return acc;
          acc.push(item);
          return acc;
        }, []);
      next.sort((a, b) => (b?._clientTs || 0) - (a?._clientTs || 0));
      // update last fetched
      if (next[0]) {
        lastFetchedAtRef.current = next[0].createdAt || new Date(next[0]._clientTs).toISOString();
      }
      // recompute unread count from new state
      setUnreadCount(next.filter(x => !x.isRead).length);
      return next;
    });

    // try to play sound (may be blocked until user interaction)
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }
    } catch {
      /* audio play failed */
    }

    // If this payload looks like a follow-up reminder, enqueue/show it
    try {
      const follow = isLikelyFollowup(payload);
      if (follow) {
        enqueueFollowup(n);
      }
    } catch {
      /* followup detection error */
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
          try { window.focus(); } catch { /* ignore */ }
          // open panel as user clicked the notification
          setIsPanelOpen(true);
        };
      }
    } catch {
      /* desktop notification failed */
    }
  };

  // ensure the ref always points to the latest handler (avoids stale closures)
  handlerRef.current = handleIncomingNotification;

  // --- Followup reminder helpers ---
  const clearFollowupTimer = (id) => {
    try {
      const t = followupTimersRef.current[id];
      if (t) {
        clearTimeout(t);
        delete followupTimersRef.current[id];
      }
    } catch { /* ignore */ }
  };

  const stopAudio = () => {
    try {
      const audio = audioRef.current;
      if (audio) {
        audio.loop = false;
        audio.pause();
        try { audio.currentTime = 0; } catch { /* ignore */ }
      }
      setIsRinging(false);
    } catch { /* ignore */ }
  };

  const showFollowupNow = (notification) => {
    try {
      setFollowupReminder({ notification, nextShowAt: null });
      // set ringing state for UI bell animation
      try {
        setIsRinging(true);
      } catch { /* ignore */ }
      // play audio immediately (best-effort)
      const audio = audioRef.current;
      if (audio) {
        // try to unlock just in case user hasn't interacted yet
        unlockAudio().finally(() => {
          try {
            audio.loop = true; // keep ringing until user action
            audio.currentTime = 0;
            audio.play().catch(() => {});
          } catch { /* ignore */ }
        });
      }
    } catch { /* ignore */ }
  };

  const enqueueFollowup = (notification) => {
    try {
      // if nothing showing, show right away
      if (!followupReminder) {
        showFollowupNow(notification);
        return;
      }
      // else push to queue
      followupQueueRef.current.push(notification);
    } catch (err) {
        console.error('enqueueFollowup failed', err);
      }
  };

  const _showNextQueuedFollowup = () => {
    try {
      const next = followupQueueRef.current.shift();
      if (next) showFollowupNow(next);
    } catch { /* ignore */ }
  };

  const snoozeFollowup = (id, minutes = 5) => {
    try {
      // find the notification either in current reminder or queue
      let notif = null;
      if (followupReminder?.notification && (followupReminder.notification.notificationId === id || followupReminder.notification._id === id)) {
        notif = followupReminder.notification;
        setFollowupReminder(null);
        try { stopAudio(); } catch { /* ignore */ }
      } else {
        // remove from queue if present
        const idx = followupQueueRef.current.findIndex(n => (n.notificationId || n._id) === id);
        if (idx !== -1) {
          notif = followupQueueRef.current.splice(idx, 1)[0];
        }
      }
      if (!notif) return;
      // schedule to show again
      const ms = Math.max(1, Number(minutes)) * 60 * 1000;
      const timer = setTimeout(() => {
        try {
          showFollowupNow(notif);
          delete followupTimersRef.current[id];
        } catch { /* ignore */ }
      }, ms);
      followupTimersRef.current[id] = timer;
      // show queued next if any
      _showNextQueuedFollowup();
  } catch (err) { console.error('snoozeFollowup failed', err); }
  };

  const dismissFollowup = async (id) => {
    try {
      // clear any timers
      clearFollowupTimer(id);
      // remove current or queued
      if (followupReminder?.notification && (followupReminder.notification.notificationId === id || followupReminder.notification._id === id)) {
        setFollowupReminder(null);
      } else {
        const idx = followupQueueRef.current.findIndex(n => (n.notificationId || n._id) === id);
        if (idx !== -1) followupQueueRef.current.splice(idx, 1);
      }
      // stop ringing if this was the current reminder
      try { stopAudio(); } catch { /* ignore */ }
      // mark read on server
      try {
        await api.post(`/notifications/${id}/read`);
      } catch { /* don't block */ }
      // show next queued followup
      _showNextQueuedFollowup();
  } catch (err) { console.error('dismissFollowup failed', err); }
  };

  // keep unread count consistent whenever notifications array changes
  useEffect(() => {
    try {
      setUnreadCount((notifications || []).filter(n => !n.isRead).length);
    } catch (err) {
      // be defensive
      console.debug('failed to recompute unreadCount', err);
    }
  }, [notifications]);

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
        // unreadCount will be recomputed by the notifications effect
        // keep behavior immediate for UI but effect will ensure consistency
        setUnreadCount(0);
        return next;
      });
      await api.post('/notifications/read-all');
    } catch (err) {
      console.error('markAllRead failed', err);
    }
  };

  // expose followup controls via context so UI can call snooze/dismiss
  const followupControls = {
    reminder: followupReminder,
    snooze: snoozeFollowup,
    dismiss: dismissFollowup,
  };

  // dev helper removed

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
      setNotifications,
      followupControls,
      isRinging
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export default NotificationsContext;
