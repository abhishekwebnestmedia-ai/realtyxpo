import React from 'react';
import { Info } from 'lucide-react';

const ChatHeader = ({ teamName, showActiveCount = false, activeCount = 0, onInfoClick }) => {
  return (
    <>
      <div className="sticky top-0 z-20 bg-white">
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex flex-col justify-center items-start gap-0.5">
              <h1 className="text-lg font-semibold text-gray-900">{teamName}</h1>
              {showActiveCount && (
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">{activeCount} active</span>
                </div>
              )}
            </div>
            {onInfoClick && (
              <button 
                onClick={onInfoClick}
                className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors"
                aria-label="View team members"
              >
                <Info size={20} />
              </button>
            )}
          </div>
        </div>
        <hr style={{ borderColor: '#C6CFFF', borderWidth: '1px' }} className="flex-shrink-0" />
      </div>
    </>
  );
};

export default ChatHeader;
