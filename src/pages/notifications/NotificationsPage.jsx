import React from 'react';
import { useNotifications } from '../../hooks/useNotifications';

const NotificationsPage = () => {
  const { notifications, markAsRead } = useNotifications();
  

  return (
    <div className="">
      <h1 className="pageheading mb-4">All Notifications</h1>
      <div className="bg-white rounded-lg shadow-sm border">
        {notifications.map(n => (
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
    </div>
  );
};

export default NotificationsPage;
