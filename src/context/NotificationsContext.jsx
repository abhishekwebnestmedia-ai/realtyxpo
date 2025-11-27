import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { toast } from 'react-hot-toast';
import io from 'socket.io-client';
import api from '../api/api';
import { parseLocalTimestamp } from '../utils/datetime';
import { AuthContext } from './AuthContextCore';

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
  const { user, isAuthenticated } = useContext(AuthContext) || {};
  // Prevent notifications from starting on auth routes (login/register)
  const onAuthPage = typeof window !== 'undefined' ? /\/(login|auth|signin|signup)(?:$|\/)/i.test(window.location.pathname) : false;
  // Rely on explicit isAuthenticated flag from AuthContext + user presence
  const isAuthed = Boolean(isAuthenticated && user) && !onAuthPage;
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [followupReminder, setFollowupReminder] = useState(null); // { notification, receivedAt }
  const [isRinging, setIsRinging] = useState(false);
  const socketRef = useRef(null);
  const audioRef = useRef(null);
  const pollingRef = useRef(null);
  const followupQueueRef = useRef([]);
  const followupTimersRef = useRef({});
  const lastFetchedAtRef = useRef(null);
  const handlerRef = useRef(null);

  // Start polling helper (stable via useCallback) — only runs when authenticated
  const startPolling = useCallback((interval = 20000) => {
    if (pollingRef.current) return;
    pollingRef.current = setInterval(async () => {
      try {
        if (!isAuthed) return; // don't poll when not authenticated
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
  }, [isAuthed]);

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

  const getCurrentUserId = useCallback(() => {
    try {
      if (user) return user._id || user.userId || user.id || null;
      return null;
    } catch {
      return null;
    }
  }, [user]);

  // fetch initial list (only when authenticated)
  useEffect(() => {
    let mounted = true;
    if (!isAuthed) {
      // cleanup state when unauthenticated (e.g., on login page or logout)
      setNotifications([]);
      setUnreadCount(0);
      setFollowupReminder(null);
      setIsRinging(false);
      lastFetchedAtRef.current = null;
      return () => { mounted = false; };
    }

    (async () => {
      try {
        const resp = await api.get('/notifications');
        const list = resp.data?.data || resp.data || [];
        if (!mounted) return;
        const normalized = (list || []).map((n) => ({
          notificationId: n._id || n.notificationId,
          _clientTs: computeClientTimestamp(n.createdAt || n.createdAtISO || n.date || n.followUp || n.followUpDate),
          // normalize server 'read' field into client 'isRead'
          ...n,
          isRead: n.isRead ?? n.read ?? false,
        }));
        normalized.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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
  }, [isAuthed]);

  // Central handler for any notification payload (socket + polling)
  useEffect(() => {
    handlerRef.current = (payload) => {
      if (!payload) return;

      try {
        const notificationId = payload._id || payload.notificationId;
        const createdTs = computeClientTimestamp(
          payload.createdAt || payload.createdAtISO || payload.date || payload.followUp || payload.followUpDate
        );

        setNotifications((prev) => {
          const existingIdx = prev.findIndex((n) => (n._id || n.notificationId) === notificationId);
          const base = {
            notificationId,
            _clientTs: createdTs,
            ...payload,
            isRead: payload.isRead ?? payload.read ?? false,
          };

          if (existingIdx === -1) {
            const next = [base, ...prev];
            next.sort((a, b) => (b._clientTs || 0) - (a._clientTs || 0));
            return next;
          }

          const next = [...prev];
          next[existingIdx] = { ...next[existingIdx], ...base };
          next.sort((a, b) => (b._clientTs || 0) - (a._clientTs || 0));
          return next;
        });

        setUnreadCount((current) => {
          const isRead = payload.isRead ?? payload.read ?? false;
          if (isRead) return current;
          return current + 1;
        });

        // Detect follow-up reminder notifications for lead / inventory / broker
        const meta = payload.meta || {};
        // Check multiple ways to identify a followup notification
        const isFollowupNotification = 
          (meta.followupReminder && meta.event === 'followup') ||
          (meta.followupReminder === true) ||
          (meta.event === 'followup') ||
          (payload.message && /follow[\s-]?up/i.test(payload.message) && /reminder|missed/i.test(payload.message));
        
        if (isFollowupNotification) {
          console.log('📩 Followup notification detected:', { meta, message: payload.message });
          const entity = meta.entity || (payload.type ? payload.type.toLowerCase() : null);
          const targetId =
            payload.leadId ||
            payload.inventoryId ||
            payload.brokerId ||
            payload.itemId ||
            payload._id;

          if (targetId) {
            setFollowupReminder({
              notification: {
                ...payload,
                entity: entity || 'lead',
                targetId,
              },
              receivedAt: Date.now(),
            });

            // optional bell sound
            try {
              const audio = audioRef.current;
              if (audio) {
                audio.currentTime = 0;
                audio.loop = false;
                audio.play().catch(() => {});
              }
            } catch {
              // ignore audio errors
            }
          }
        }
      } catch (err) {
        console.error('Notification handler error', err);
      }
    };
  }, []);

  // connect socket.io and fallback polling (only when authenticated)
  useEffect(() => {
    if (!isAuthed) {
      // ensure everything is stopped when unauthenticated
      if (socketRef.current) {
        try { socketRef.current.off(); socketRef.current.disconnect(); } catch { /* ignore */ }
        socketRef.current = null;
      }
      if (pollingRef.current) {
        clearInterval(pollingRef.current);
        pollingRef.current = null;
      }
      // stop any ringing audio
      try { const a = audioRef.current; if (a) { a.pause(); a.currentTime = 0; a.loop = false; } } catch { /* ignore */ }
      setIsRinging(false);
      setFollowupReminder(null);
      followupQueueRef.current = [];
      Object.values(followupTimersRef.current || {}).forEach(t => clearTimeout(t));
      followupTimersRef.current = {};
      return;
    }

    const token = isAuthed && typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // create socket
    try {
      const wsUrl = resolveWsUrl();
      const opts = { transports: ['websocket', 'polling'], withCredentials: true };
      if (token) opts.auth = { token };
      socketRef.current = io(wsUrl, opts);

      const onConnect = () => {
        console.log('✅ Socket connected successfully');
        // socket connected
        // stop polling when connected
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
        const userId = getCurrentUserId();
        const userRole = user?.role || null;
        console.log('🔐 Registering user:', { userId, role: userRole });
        if (userId) {
          // Send both userId and role so backend can join admin room
          socketRef.current.emit('register_user', { userId, role: userRole });
          socketRef.current.emit('subscribe_notifications', { userId, role: userRole });
        }
        // one-time sync after connect to avoid missing notifications during the transition
        (async () => {
          try {
            const since = lastFetchedAtRef.current;
            const url = since ? `/notifications?since=${encodeURIComponent(since)}` : '/notifications';
            const resp = await api.get(url);
            const list = resp.data?.data || resp.data || [];
            if (Array.isArray(list) && list.length) {
              console.log(`📥 Synced ${list.length} notifications after socket connect`);
              list.forEach(p => handlerRef.current?.(p));
            }
          } catch (err) { console.error('one-off sync failed', err); }
        })();
      };

      socketRef.current.on('connect', onConnect);
      socketRef.current.on('registered_success', (data) => {
        console.log('✅ Registered for notifications:', data);
      });

      socketRef.current.on('notification', (payload) => {
        console.log('📩 Notification event received:', payload);
        try { payload.__event = 'notification'; } catch { /* ignore */ }
        handlerRef.current?.(payload);
      });

      socketRef.current.on('notification_received', (payload) => {
        console.log('📩 notification_received event:', payload);
        try { payload.__event = 'notification_received'; } catch { /* ignore */ }
        handlerRef.current?.(payload);
      });

      // Temporary: also listen for legacy/cron event name so client receives follow-up emits
      // emitted by older server code (followup_notification). Remove after server uses
      // the standardized 'notification' event name.
      socketRef.current.on('followup_notification', (payload) => {
        console.log('📩 followup_notification event:', payload);
        try { payload.__event = 'followup_notification'; } catch { /* ignore */ }
        handlerRef.current?.(payload);
      });

      socketRef.current.on('disconnect', (reason) => {
        console.log('❌ Socket disconnected:', reason);
        // start polling fallback
        if (!pollingRef.current) startPolling();
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('❌ Socket connection error:', error);
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
        socketRef.current.off('connect_error');
        socketRef.current?.disconnect();
      }
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [isAuthed, startPolling, getCurrentUserId, user]);

  // original startPolling moved above and memoized

  const isLikelyFollowup = (payload) => {
    try {
      if (!payload || typeof payload !== 'object') return false;

      const meta = payload.meta && typeof payload.meta === 'object' ? payload.meta : null;
      if (meta) {
        const metaFlags = [meta.followup, meta.followUp, meta.followupReminder, meta.followUpReminder, meta.isFollowupReminder];
        if (metaFlags.some((flag) => flag && flag !== 'false' && flag !== '0')) return true;

        const metaStrings = [meta.category, meta.type, meta.kind];
        if (metaStrings.some((val) => typeof val === 'string' && /follow[\s-]?up/.test(val.toLowerCase()))) {
          const joined = metaStrings.filter(Boolean).join(' ').toLowerCase();
          const looksLikeUpdate = /update|change|reschedul/.test(joined);
          if (!looksLikeUpdate) return true;
        }
      }

      if (payload.__event === 'followup_notification') return true;

      const message = (payload.message || '').toString().trim().toLowerCase();
      if (!message) return false;

      const mentionsFollowup = /follow[\s-]?up/.test(message);
      if (!mentionsFollowup) return false;

      const looksLikeScheduleChange = /date\s*(has\s*)?updated|updated\s+by|reschedul|resched|change(d)?|snoozed/.test(message);
      if (looksLikeScheduleChange) return false;

      return true;
    } catch {
      return false;
    }
  };

  const handleIncomingNotification = (payload) => {
    // incoming payload received
    const n = {
      notificationId: payload._id || payload.notificationId || payload.id,
      createdAt: payload.createdAt || new Date().toISOString(),
      _clientTs: computeClientTimestamp(payload.createdAt || payload.createdAtISO || payload.date || payload.followUp || payload.followUpDate),
      ...payload,
      // ensure consistent boolean flag on client
      isRead: payload.isRead ?? payload.read ?? false,
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

    // If this payload looks like a follow-up reminder, enqueue/show it (and handle audio there)
    try {
      const follow = isLikelyFollowup(payload);
      // Only enqueue followup reminders if the notification is not already read
      if (follow && !n.isRead) {
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
        await api.put(`/notifications/${id}/read`, { read: true });
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

  // If a notification was marked read elsewhere, ensure followup reminders do not ring/show.
  useEffect(() => {
    try {
      // If the currently showing followup has been marked read, dismiss it and stop audio
      if (followupReminder?.notification) {
        const curId = followupReminder.notification.notificationId || followupReminder.notification._id;
        const found = (notifications || []).find(n => (n.notificationId || n._id) === curId);
        if (found && found.isRead) {
          // dismiss without calling server (already marked)
          setFollowupReminder(null);
          try { stopAudio(); } catch { /* ignore */ }
        }
      }

      // Remove any queued followups that are now marked read
      try {
        followupQueueRef.current = (followupQueueRef.current || []).filter(q => {
          const id = q.notificationId || q._id;
          const stored = (notifications || []).find(n => (n.notificationId || n._id) === id);
          // keep if not found in notifications (conservative) or not read
          return !stored || !stored.isRead;
        });
      } catch (e) { /* ignore */ }
    } catch (err) {
      /* ignore */
    }
  }, [notifications]);

  // (dev helper removed)

  const markAsRead = async (id) => {
    try {
      // Call server first; on success update local state to avoid optimistic mismatch
      await api.put(`/notifications/${id}/read`, { read: true });
      setNotifications(prev => {
        const next = prev.map(n => (n.notificationId === id || n._id === id) ? { ...n, isRead: true } : n);
        setUnreadCount(next.filter(x => !x.isRead).length);
        return next;
      });
    } catch (err) {
      console.error('markAsRead failed', err);
      try {
        toast.error(err?.response?.data?.message || err?.response?.data?.error || 'Failed to mark notification read');
      } catch { /* ignore toast errors */ }
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
      await api.put('/notifications/read-all');
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

  // Keep bell animation state consistent with reminder visibility
  useEffect(() => {
    setIsRinging(Boolean(followupReminder));
  }, [followupReminder]);

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
