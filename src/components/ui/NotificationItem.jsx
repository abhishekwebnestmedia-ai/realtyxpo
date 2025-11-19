import React, { useState } from 'react';
import { Building2, ShieldAlert, User, MessageCircle, Info, Bell } from 'lucide-react';
import { formatLocalTimestamp } from '../../utils/datetime';

// Reusable, compact notification row used in Panel and Notifications page
const NotificationItem = ({ notification: n, onOpen, onMarkRead }) => {
  const formatTimestamp = (raw) => formatLocalTimestamp(raw);

  const renderIcon = () => {
    // Use neutral, non-tick icons to avoid "check" visuals
    const action = n?.meta?.action;
    if (action === 'inventory_approval') return <ShieldAlert className="w-5 h-5 text-yellow-700" />;
    // follow-up detection: explicit meta fields or reminder wording
    if (n?.meta?.followUpDate || n?.meta?.followUpReadable || String(n.message || '').toLowerCase().includes('reminder')) {
      return <Bell className="w-5 h-5 text-amber-600" />;
    }
    if (n.type === 'Inventory') return <Building2 className="w-5 h-5 text-green-600" />;
    if (n.type === 'Lead') return <User className="w-5 h-5 text-blue-600" />;
    if (n.type === 'Broadcast') return <MessageCircle className="w-5 h-5 text-indigo-600" />;
    return <Info className="w-5 h-5 text-gray-500" />;
  };

  const badgeFor = () => {
    const action = n?.meta?.action;
    if (action === 'inventory_approval') return { label: 'Approval', color: 'bg-yellow-100 text-yellow-800' };
    if (n.type === 'Inventory') return { label: 'Inventory', color: 'bg-green-100 text-green-800' };
    if (n.type === 'Lead') return { label: 'Lead', color: 'bg-blue-100 text-blue-800' };
    if (n.type === 'Broadcast') return { label: 'Broadcast', color: 'bg-indigo-100 text-indigo-800' };
    return { label: 'Info', color: 'bg-gray-100 text-gray-800' };
  };

  const badge = badgeFor();

  const [expanded, setExpanded] = useState(false);
  const message = String(n.message || '');
  const TRUNCATE_LEN = 70;
  const isLong = message.length > TRUNCATE_LEN;
  const short = isLong ? (message.slice(0, TRUNCATE_LEN).trim() + '…') : message;

  return (
    <div className={`px-3 pt-3 pb-3 border-b hover:bg-gray-50 ${n.isRead ? 'bg-white' : 'bg-slate-50'}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${n.isRead ? 'bg-white' : 'bg-white'}`}>
            {renderIcon()}
          </div>
        </div>

        <div className="flex-1 flex flex-col">
          {/* Icon + Heading inline */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="text-xs font-semibold text-gray-600 uppercase tracking-wide">{badge.label}</div>
            </div>
            <div className="flex items-center gap-3">
              {!n.isRead && (
                <button
                  onClick={(e) => { e.stopPropagation(); onMarkRead?.(n); }}
                  className="text-[11px] text-blue-600 hover:underline"
                >
                  Mark read
                </button>
              )}
            </div>
          </div>

          {/* Message full width below heading (truncated with Read more) */}
          <div className="mt-1">
            <div
              onClick={() => onOpen?.(n)}
              className="text-sm text-left text-gray-800 cursor-pointer p-0 m-0 leading-snug w-full"
              title={message}
            >
              <span className={`block ${n.isRead ? '' : 'font-semibold'}`}>{expanded ? message : short}</span>
            </div>

            {isLong && (
              <button
                onClick={(e) => { e.stopPropagation(); setExpanded(prev => !prev); }}
                className="text-xs text-blue-600 mt-1"
              >
                {expanded ? 'Read less' : 'Read more'}
              </button>
            )}
          </div>

          {/* Footer: timestamp and Mark read aligned bottom-right */}
          <div className="flex items-center" onClick={(e) => { e.stopPropagation(); }}>
            <div className="flex-1" />
            <div className="text-right">
              <div className="text-[11px] text-gray-500">{formatTimestamp(n._clientTs ?? n.createdAt)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotificationItem;
