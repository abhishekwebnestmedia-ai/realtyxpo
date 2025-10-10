import React, { useEffect, useRef } from 'react';
import MessageItem from './MessageItem';
import DateSeparator from './DateSeparator';

const MessageList = ({ messages }) => {
  const messagesEndRef = useRef(null);

  // Scroll to bottom when new messages are added
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto scrollbar-hidden flex flex-col">
      <div className={`flex-1 px-6 py-4 flex flex-col ${messages.length <= 3 ? 'justify-end' : ''}`}>
        {messages.length > 0 && <DateSeparator />}
        <div className="flex flex-col gap-3">
          {messages.map((msg) => (
            <MessageItem key={msg.id} message={msg} isOwn={msg.isOwn} />
          ))}
        </div>
        {/* Invisible element to scroll to */}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
};

export default MessageList;
