import React from 'react';

const DateSeparator = ({ date = "Today" }) => {
  return (
    <div className="flex items-center justify-center py-4 flex-shrink-0">
      <div className="flex items-center w-full max-w-xs">
        <hr className="flex-1 border-gray-300" />
        <span className="px-4 text-sm text-gray-500 bg-white">{date}</span>
        <hr className="flex-1 border-gray-300" />
      </div>
    </div>
  );
};

export default DateSeparator;
