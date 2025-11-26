import React, { useMemo, useState } from 'react';
import { useNotifications } from '../../hooks/useNotifications';
import { formatLocalTimestamp, parseLocalTimestamp } from '../../utils/datetime';
import InventoryApprovalModal from '../../components/modals/InventoryApprovalModal';
import NotificationItem from '../../components/ui/NotificationItem';

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
    // prefer client-side epoch if available (may be set as _groupTs by caller)
    const created = (n._groupTs || n._clientTs) || n.createdAt || n.createdAtISO || n.date || null;
    let key = 'Unknown';
    try {
      if (created) {
        const ts = typeof created === 'number' ? created : parseLocalTimestamp(created);
        const d = new Date(ts || Date.now());
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
        const xa = x._clientTs ?? (x.createdAt ? new Date(x.createdAt).getTime() : 0);
        const ya = y._clientTs ?? (y.createdAt ? new Date(y.createdAt).getTime() : 0);
        return ya - xa; // newest first
      })
    }));
  return out;
};

const NotificationsPage = () => {
  const { notifications, markAsRead } = useNotifications();
  const [activeNotification, setActiveNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const formatTimestamp = (raw) => formatLocalTimestamp(raw);

  // ensure grouping uses client-side timestamp when available
  const grouped = useMemo(() => {
    // annotate temporary created value for grouping
    const withClient = (notifications || []).map(n => ({
      ...n,
      _groupTs: n._clientTs || parseLocalTimestamp(n.createdAt) || 0
    }));
    return groupNotificationsByDate(withClient);
  }, [notifications]);

  return (
    <div className="">
      <h1 className="pageheading mb-4">All Notifications</h1>
      <div className=" ">
        {grouped.map((group) => (
          <div key={group.key}>
            <div className="px-4 py-3  text-sm font-semibold text-gray-700 text-center">
              <span className="inline-block px-3 py-1  rounded-full shadow-sm">{group.title}</span>
            </div>
            {group.items.map((n) => (
              <div key={n.notificationId || n._id}>
                <NotificationItem
                  notification={n}
                  onOpen={(notif) => {
                    // If this notification requests inventory approval, open the modal
                    if (notif?.meta?.action === 'inventory_approval' || (notif.type === 'Inventory' && notif?.meta?.action === 'inventory_approval')) {
                      setActiveNotification(notif);
                      setIsModalOpen(true);
                      return;
                    }
                    // Future: open detail drawer or expand
                  }}
                  onMarkRead={(notif) => markAsRead(notif.notificationId || notif._id)}
                />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default NotificationsPage;
