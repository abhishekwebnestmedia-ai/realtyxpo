import React from 'react';

// Small, accessible toggle switch used in permissions modal
// Props: checked: boolean, onChange: fn, disabled?: boolean
const SmallSwitch = ({ checked = false, onChange = () => {}, disabled = false }) => {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none ${checked ? 'bg-blue-600' : 'bg-gray-200'} ${disabled ? 'opacity-60 cursor-not-allowed' : ''}`}
    >
      <span
        className={`inline-block w-4 h-4 transform bg-white rounded-full shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-1'}`}
      />
    </button>
  );
};

export default SmallSwitch;
