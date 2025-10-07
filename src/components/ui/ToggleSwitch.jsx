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
  // Dynamic width calculation based on content and number of options
  const getWidthClass = () => {
    const maxLabelLength = Math.max(...options.map(opt => opt.label.length));
    const numOptions = options.length;
    
    if (numOptions <= 2) {
      return maxLabelLength > 12 ? 'min-w-[28rem]' : 'min-w-[20rem]';
    } else if (numOptions === 3) {
      return maxLabelLength > 12 ? 'min-w-[36rem]' : 'min-w-[30rem]';
    } else {
      return maxLabelLength > 8 ? 'min-w-[40rem]' : 'min-w-[32rem]';
    }
  };

  // Size configurations
  const sizeClasses = {
    sm: {
      buttonClasses: 'px-3 py-2 text-xs font-medium',
      containerClasses: 'p-1'
    },
    md: {
      buttonClasses: 'px-4 py-3 text-sm font-medium',
      containerClasses: 'p-1'
    },
    lg: {
      buttonClasses: 'px-6 py-4 text-base font-medium',
      containerClasses: 'p-1.5'
    }
  };

  const { buttonClasses, containerClasses } = sizeClasses[size];

  // Calculate transform based on selected option index
  const selectedIndex = options.findIndex(option => option.value === value);
  const transformValue = selectedIndex > 0 
    ? `translateX(calc(${selectedIndex * 100}% + ${selectedIndex * 4}px))`
    : 'translateX(2px)';

  const highlightWidth = `calc(${100 / options.length}% - 4px)`;

  return (
    <div className={`relative flex ${getWidthClass()} bg-gray-50 rounded-full ${containerClasses} overflow-hidden  ${className}`}>
      {/* Sliding highlight */}
      <div
        className="absolute top-1 bottom-1 left-[2px] rounded-full transition-all duration-300 ease-in-out shadow-md"
        style={{
          width: highlightWidth,
          transform: transformValue,
          backgroundColor: '#020E4F'
        }}
      />

      {/* Buttons */}
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={`relative flex-1 ${buttonClasses} transition-all duration-200 z-10 whitespace-nowrap rounded-lg ${
            value === option.value 
              ? "text-white font-semibold" 
              : "text-gray-700 hover:text-gray-900 font-medium"
          }`}
        >
          <span className="relative z-10 flex items-center justify-center gap-2">
            {option.icon && <option.icon className="h-4 w-4" />}
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
};

export default ToggleSwitch;