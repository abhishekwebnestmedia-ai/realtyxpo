import React, { useState, useRef } from 'react';
import { Send, Paperclip, X } from 'lucide-react';

const MessageComposer = ({ onSendMessage, disabled = false }) => {
  const [message, setMessage] = useState('');
  const [attachment, setAttachment] = useState(null);
  const fileInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if ((message.trim() || attachment) && onSendMessage) {
      onSendMessage({ text: message.trim() }, attachment);
      setMessage('');
      setAttachment(null);
    }
  };

  const handleAttachmentChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  if (disabled) return null; // Hide for read-only users

  return (
    <div className="p-4 flex-shrink-0">
      {attachment && (
        <div className="mb-3 p-3 bg-gray-50 rounded-lg flex items-center justify-between">
          <span className="text-sm text-gray-700 truncate">
            📎 {attachment.name}
          </span>
          <button
            type="button"
            onClick={removeAttachment}
            className="ml-2 p-1 hover:bg-gray-200 rounded-full"
          >
            <X size={16} className="text-gray-500" />
          </button>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="flex items-center gap-3">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleAttachmentChange}
          className="hidden"
          accept="image/*,application/pdf,.doc,.docx,.txt"
        />
        
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Paperclip size={20} />
        </button>
        
        <input
          type="text"
          placeholder="Message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <button
          type="submit"
          className="p-2 bg-[var(--blue700)] text-white rounded-lg hover:bg-blue-800 transition-colors"
          disabled={!message.trim() && !attachment}
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
};

export default MessageComposer;
