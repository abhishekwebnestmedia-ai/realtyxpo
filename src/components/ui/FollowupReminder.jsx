import React from 'react';
import { useNavigate } from 'react-router-dom';
import { formatLocalTimestamp } from '../../utils/datetime';

const FollowupReminder = ({ reminder, onSnooze, onDismiss }) => {
  const navigate = useNavigate();
  
  if (!reminder || !reminder.notification) return null;
  const n = reminder.notification;
  const id = n.notificationId || n._id;
  const meta = n.meta && typeof n.meta === 'object' ? n.meta : {};
  const status = typeof meta.status === 'string' ? meta.status.toLowerCase() : 'due';
  const isMissed = status === 'missed';
  const followUpAt = meta.followUpDueAt || n.followUp || n.followUpDate || n.date || n.createdAt;
  const headerTitle = isMissed ? 'Missed Follow-up' : 'Follow-up Reminder';
  const bannerGradient = isMissed ? 'from-red-500 to-red-600' : 'from-blue-500 to-blue-600';
  
  // Determine entity type and navigation path
  const entity = n.entity || meta.entity || (n.type ? n.type.toLowerCase() : 'lead');
  const targetId = n.targetId || n.leadId || n.inventoryId || n.brokerId || n.itemId;
  
  const handleView = () => {
    onDismiss(id); // Dismiss the reminder
    // Navigate to the appropriate detail page
    if (entity === 'lead' && targetId) {
      navigate(`/all-leads/${targetId}`);
    } else if (entity === 'inventory' && targetId) {
      navigate(`/inventory/${targetId}`);
    } else if (entity === 'broker' && targetId) {
      navigate(`/broker-requirements`); // or specific broker page if exists
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className={`px-6 py-4 bg-gradient-to-br ${bannerGradient} text-white`}>
          <div className="flex items-center justify-between">
            <div className="font-semibold">{headerTitle}</div>
            <div className="text-xs bg-white/20 px-2 py-1 rounded capitalize">{entity}</div>
          </div>
        </div>
        <div className="p-6">
          <div className="text-sm text-gray-800">{n.message}</div>
          <div className="text-xs text-gray-500 mt-3">
            {isMissed ? 'Scheduled for: ' : 'Scheduled at: '} {formatLocalTimestamp(followUpAt)}
          </div>
        </div>
        <div className="px-6 pb-6 pt-0 flex items-center justify-between">
          <button 
            onClick={handleView} 
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
          >
            View {entity.charAt(0).toUpperCase() + entity.slice(1)}
          </button>
          <div className="flex items-center gap-2">
            <button onClick={() => onSnooze(id, 5)} className="px-3 py-2 bg-yellow-200 rounded text-sm hover:bg-yellow-300">Snooze 5m</button>
            <button onClick={() => onSnooze(id, 15)} className="px-3 py-2 bg-yellow-300 rounded text-sm hover:bg-yellow-400">Snooze 15m</button>
            <button onClick={() => onDismiss(id)} className="px-3 py-2 bg-red-600 text-white rounded text-sm hover:bg-red-700">Dismiss</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FollowupReminder;
