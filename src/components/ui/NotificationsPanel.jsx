import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPanel = () => {
  const { notifications, isPanelOpen, closePanel, markAsRead, markAllRead } = useNotifications();
  const navigate = useNavigate();
  const panelRef = useRef(null);
  const previouslyFocused = useRef(null);

  useEffect(() => {
    if (!isPanelOpen) return;
    previouslyFocused.current = document.activeElement;

    const el = panelRef.current;
    if (el) {
      // Focus first focusable inside panel
      const focusable = el.querySelector('button, a, [tabindex]:not([tabindex="-1"])');
      focusable?.focus();
    }

    // Use pointerdown for better cross-device behavior and composedPath to handle shadow DOM
    const handleOutsidePointer = (event) => {
      try {
        const panel = panelRef.current;
        if (!panel) return;

        const path = event.composedPath ? event.composedPath() : (event.path || []);
        // if click inside panel, ignore
        if (path.includes(panel) || panel.contains(event.target)) return;

        // if click is on the bell button or inside it, ignore
        const bell = document.querySelector('[aria-label="Open notifications"]');
        if (bell && (path.includes(bell) || bell.contains(event.target))) return;

        closePanel();
      } catch {
        // keep silent on handler errors
      }
    };

    const onKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        closePanel();
      }
      // simple focus trap
      if (e.key === 'Tab') {
        const panel = panelRef.current;
        if (!panel) return;
        const focusableEls = panel.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        const first = focusableEls[0];
        const last = focusableEls[focusableEls.length - 1];
        if (!first || !last) return;
        if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      }
    };

    document.addEventListener('pointerdown', handleOutsidePointer);
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handleOutsidePointer);
      document.removeEventListener('keydown', onKeyDown);
  try { previouslyFocused.current?.focus(); } catch { /* ignore */ }
    };
  }, [isPanelOpen, closePanel]);

  if (!isPanelOpen) return null;

  const goToNotification = (n) => {
    if (n.type === 'Lead') navigate(`/all-leads/${n.itemId}`, { state: { notification: n } });
    else if (n.type === 'Inventory') navigate(`/inventory/${n.itemId}`);
    markAsRead(n.notificationId || n._id);
    closePanel();
  };

  return (
      <div ref={panelRef} className="fixed right-6 top-[5rem] z-50 w-[23rem] bg-white rounded-lg shadow-md max-h-[65vh] border flex flex-col " role="dialog" aria-modal="true">
        <div className="px-3 py-2 border-b flex justify-between items-center flex-none">
          <h4 className="font-semibold text-base">Notifications</h4>
          <div className="flex items-center gap-2">
            <button className="text-sm text-gray-600" onClick={markAllRead}>Mark all</button>
            <button className="text-sm text-gray-600" onClick={() => { closePanel(); navigate('/notifications'); }}>View all</button>
          </div>
        </div>

        <div className="flex-1 overflow-auto scrollbar-hidden">
          {notifications.length === 0 && <div className="p-4 text-sm text-gray-500">No notifications</div>}
          {notifications.map(n => (
            <div key={n.notificationId || n._id} className={`p-3 border-b hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
              <div className="text-sm text-gray-800 cursor-pointer" onClick={() => goToNotification(n)} tabIndex={0}>{n.message}</div>
              <div className="text-xs text-gray-500 flex justify-between items-center mt-2">
                <span>{new Date(n.createdAt).toLocaleString()}</span>
                {!n.isRead && <button onClick={() => markAsRead(n.notificationId || n._id)} className="text-xs text-blue-600">Mark read</button>}
              </div>
            </div>
          ))}
        </div>
      </div>
  );
};

export default NotificationsPanel;
