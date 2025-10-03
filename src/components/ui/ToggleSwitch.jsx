import React from 'react';

/**
 * Reusable Toggle Switch Component
 * @param {Object} props - Component props
 * @param {string} props.value - Current selected value
 * @param {Array} props.options - Array of option objects with {value, label} properties
 * @param {Function} props.onChange - Callback function when value changes
 * @param {string} props.className - Additional CSS classes
 * @param {string} props.size - Size variant: 'sm', 'md', 'lg'
 */
const ToggleSwitch = ({ 
  value, 
  options = [], 
  onChange, 
  className = '',
  size = 'md'
}) => {
  // Size configurations
  const sizeClasses = {
    sm: 'w-64 px-2 py-[0.5rem] text-xs',
    md: 'w-80 px-3 py-[0.65rem] text-sm',
    lg: 'w-96 px-4 py-3 text-base'
  };

  const { containerWidth, buttonClasses } = sizeClasses[size];

  // Calculate transform based on selected option index
  const selectedIndex = options.findIndex(option => option.value === value);
  const transformValue = selectedIndex > 0 
    ? `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 6}px))`
    : 'translateX(2px)';

  const highlightWidth = `calc(${100 / options.length}% - 6px)`;

  return (
    <div className={`relative flex ${containerWidth || 'w-80'} bg-white rounded-full p-1 overflow-hidden border border-gray-200 ${className}`}>
      {/* Sliding highlight */}
      <div
        className="absolute top-1 bottom-1 left-[2px] bg-[#000D55] rounded-full transition-transform duration-300 ease-in-out"
        style={{
          width: highlightWidth,
          transform: transformValue,
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 ${buttonClasses || 'px-3 py-[0.65rem] text-sm'} font-medium transition-colors z-10 whitespace-nowrap ${
            value === option.value ? "text-white" : "text-gray-700"
          }`}
        >
          <span className="relative z-10">{option.label}</span>
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;