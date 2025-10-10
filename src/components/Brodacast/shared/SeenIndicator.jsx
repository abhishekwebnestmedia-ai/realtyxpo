import React from 'react';

const SeenIndicator = ({ count = 4 }) => (
  <div className="flex items-center -space-x-1 mt-1">
    <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
    <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
    <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
    <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
    <span className="text-xs text-gray-500 ml-2">{count} Seen</span>
  </div>
);

export default SeenIndicator;
