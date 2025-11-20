import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import DateSeparator from './DateSeparator';

// Helpers
function toLocalDateKey(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function parseTimestamp(ts) {
  if (!ts) return new Date('');
  if (ts instanceof Date) return ts;
  if (typeof ts === 'number') return new Date(ts);
  if (typeof ts === 'string') {
    const s = ts.trim();
    // date-only like '2025-10-13' -> treat as local date
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) {
      const [y, m, d] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    // numeric string timestamp
    const n = Number(s);
    if (!isNaN(n)) return new Date(n);
    // fallback to Date parser (handles ISO with timezone)
    return new Date(s);
  }
  return new Date('');
}

function groupMessagesByDate(messages) {
  const map = {};
  (messages || []).forEach((msg) => {
    const dateObj = parseTimestamp(msg.createdAt || msg.date || msg.timestamp);
    if (isNaN(dateObj.getTime())) return;
    const key = toLocalDateKey(dateObj);
    if (!map[key]) map[key] = [];
    map[key].push(msg);
  });

  // sort keys (dates) ascending
  const keys = Object.keys(map).sort();

  // sort messages in each key by timestamp asc
  keys.forEach((k) => {
    map[k].sort((a, b) => {
      const ta = parseTimestamp(a.createdAt || a.date || a.timestamp).getTime() || 0;
      const tb = parseTimestamp(b.createdAt || b.date || b.timestamp).getTime() || 0;
      return ta - tb;
    });
  });

  return { map, keys };
}

function formatDateHeading(dateKey) {
  const [year, month, day] = dateKey.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isToday =
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate();
  if (isToday) return 'Today';

  const isYesterday =
    date.getFullYear() === yesterday.getFullYear() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getDate() === yesterday.getDate();
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Scroll the last element into view at the end of the container.
    // Use block:'end' to ensure the message sits at the bottom when the list is short.
    try {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });
    } catch {
      // Fallback for older browsers
      messagesEndRef.current?.scrollIntoView();
    }
  }, [messages]);

  const { map: grouped, keys: sortedDates } = groupMessagesByDate(messages || []);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className={`px-6 py-4 flex flex-col min-h-full ${((messages || []).length <= 3) ? 'justify-end' : ''} pb-2`}>
        <div className="flex flex-col gap-3">
          {sortedDates.map((dateKey) => (
            <React.Fragment key={dateKey}>
              <DateSeparator date={formatDateHeading(dateKey)} />
              {grouped[dateKey].map((msg) => (
                <MessageItem key={msg._id || msg.id || Math.random()} message={msg} isOwn={msg.isOwn} />
              ))}
            </React.Fragment>
          ))}
        </div>
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
