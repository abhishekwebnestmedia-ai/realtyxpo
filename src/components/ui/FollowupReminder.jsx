import React from 'react';
import { formatLocalTimestamp } from '../../utils/datetime';

const FollowupReminder = ({ reminder, onSnooze, onDismiss }) => {
  if (!reminder || !reminder.notification) return null;
  const n = reminder.notification;
  const id = n.notificationId || n._id;
  const meta = n.meta && typeof n.meta === 'object' ? n.meta : {};
  const status = typeof meta.status === 'string' ? meta.status.toLowerCase() : 'due';
  const isMissed = status === 'missed';
  const followUpAt = meta.followUpDueAt || n.followUp || n.followUpDate || n.date || n.createdAt;
  const headerTitle = isMissed ? 'Missed Follow-up' : 'Follow-up Reminder';
  const bannerGradient = isMissed ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className={`px-6 py-4 bg-gradient-to-br ${bannerGradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">{headerTitle}</div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-800">{n.message}</div>
          <div className="text-xs text-gray-500 mt-3">
            {isMissed ? 'Scheduled for: ' : 'Scheduled at: '} {formatLocalTimestamp(followUpAt)}
          </div>
        </div>
        <div className="px-6 pb-6 pt-0 flex items-center justify-end gap-3">
          <button onClick={() => onSnooze(id, 5)} className="px-3 py-2 bg-yellow-200 rounded text-sm">Snooze 5m</button>
          <button onClick={() => onSnooze(id, 15)} className="px-3 py-2 bg-yellow-300 rounded text-sm">Snooze 15m</button>
          <button onClick={() => onDismiss(id)} className="px-3 py-2 bg-red-600 text-white rounded text-sm">Dismiss</button>
        </div>
      </div>
    </div>
  );
};

export default FollowupReminder;
