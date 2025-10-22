import React, { useState, useRef, useEffect } from 'react';

const CustomSelect = ({ name, value, onChange, options = [], placeholder = '-- select --', disabled = false, className = '', id }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const selected = options.find((o) => String(o.value) === String(value));

  const handleSelect = (val) => {
    if (disabled) return;
    onChange?.({ target: { name, value: val } });
    setOpen(false);
  };

  const handleKeyDown = (e) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setOpen((s) => !s);
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  return (
    <div className={`custom-select-wrapper ${className}`} ref={ref}>
      <button
        type="button"
        id={id}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((s) => !s)}
        onKeyDown={handleKeyDown}
  className={`w-full text-left bg-[#FAFBFC] rounded border border-gray-300 text-base h-10 flex items-center justify-between px-3 ${disabled ? 'opacity-80 cursor-not-allowed bg-gray-100' : 'cursor-pointer'}`}
        disabled={disabled}
      >
        <span className="flex-1 truncate">{selected ? selected.label : placeholder}</span>
        <svg className="custom-select-caret" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M5.23 7.21a.75.75 0 011.06-.02L10 10.67l3.71-3.48a.75.75 0 111.02 1.1l-4.2 3.94a.75.75 0 01-1.02 0L5.25 8.29a.75.75 0 01-.02-1.08z"/></svg>
      </button>

      {open && (
        <div role="listbox" tabIndex={-1} className="dropdown-panel w-full mt-2 overflow-y-auto max-h-60">
          {options.map((opt, idx) => (
            <div
              role="option"
              aria-selected={String(opt.value) === String(value)}
              key={idx}
              className={`dropdown-item ${String(opt.value) === String(value) ? 'bg-gray-100 font-medium' : ''}`}
              onClick={() => handleSelect(opt.value)}
            >
              {opt.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomSelect;
