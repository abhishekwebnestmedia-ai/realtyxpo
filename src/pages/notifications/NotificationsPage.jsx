import React, { useMemo } from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const formatGroupTitle = (dateStr) => {
  if (!dateStr) return 'Unknown';
  const d = new Date(dateStr);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a, b) => a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

  if (isSameDay(d, today)) return 'Today';
  if (isSameDay(d, yesterday)) return 'Yesterday';
  return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
};

const groupNotificationsByDate = (list) => {
  const groups = {};
  (list || []).forEach((n) => {
    const created = n.createdAt || n.createdAtISO || n.date || null;
    let key = 'Unknown';
    try {
      if (created) {
        const d = new Date(created);
        // use local date (YYYY-MM-DD) to group according to user's timezone
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        key = `${y}-${m}-${dd}`;
      }
    } catch {
      key = 'Unknown';
    }
    if (!groups[key]) groups[key] = [];
    groups[key].push(n);
  });
  const out = Object.keys(groups)
    .sort((a, b) => {
      if (a === 'Unknown') return 1;
      if (b === 'Unknown') return -1;
      return b.localeCompare(a);
    })
    .map((k) => ({
      key: k,
      title: formatGroupTitle(k),
      items: (groups[k] || []).sort((x, y) => {
        const xa = new Date(x.createdAt || x.createdAtISO || x.date || 0).getTime();
        const ya = new Date(y.createdAt || y.createdAtISO || y.date || 0).getTime();
        return ya - xa; // newest first
      })
    }));
  return out;
};

const NotificationsPage = () => {
  const { notifications, markAsRead } = useNotifications();

  const grouped = useMemo(() => groupNotificationsByDate(notifications), [notifications]);

  return (
    <div className="">
      <h1 className="pageheading mb-4">All Notifications</h1>
      <div className=" ">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="px-4 py-3  text-sm font-semibold text-gray-700 text-center">
              <span className="inline-block px-3 py-1 bg-white rounded-full shadow-sm">{group.title}</span>
            </div>
            {group.items.map((n) => (
              <div key={n.notificationId || n._id} className={`p-4 border-b ${n.isRead ? 'bg-white' : 'bg-blue-50'}`}>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="text-sm text-gray-800">{n.message}</div>
                    <div className="text-xs text-gray-500 mt-2">{new Date(n.createdAt).toLocaleString()}</div>
                  </div>
                  <div className="ml-4">
                    {!n.isRead && <button onClick={() => markAsRead(n.notificationId || n._id)} className="text-blue-600 text-sm">Mark read</button>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
