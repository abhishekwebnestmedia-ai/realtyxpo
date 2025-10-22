import React, { useState, useRef, useEffect } from 'react';

// TokenSearch: a small reusable search input with token chips.
// Props:
// - value, onChange: controlled text value (optional)
// - tokens, onTokensChange: controlled tokens (optional)
// - placeholder
// - className
// - inputClassName
const TokenSearch = ({ value: controlledValue, onChange, tokens: controlledTokens, onTokensChange, placeholder = 'Search...', className = '', inputClassName = '' }) => {
  const [value, setValue] = useState(controlledValue || '');
  const [tokens, setTokens] = useState(Array.isArray(controlledTokens) ? controlledTokens : []);
  const inputRef = useRef(null);

  useEffect(() => {
    if (typeof controlledValue === 'string') setValue(controlledValue);
  }, [controlledValue]);

  useEffect(() => {
    if (Array.isArray(controlledTokens)) setTokens(controlledTokens);
  }, [controlledTokens]);

  const updateTokens = (next) => {
    if (typeof onTokensChange === 'function') onTokensChange(next);
    else setTokens(next);
  };

  const handleAdd = (t) => {
    const trimmed = String(t || '').trim();
    if (!trimmed) return;
    const deduped = tokens.includes(trimmed) ? tokens : [...tokens, trimmed];
    updateTokens(deduped);
    if (typeof onChange === 'function') onChange('');
    else setValue('');
    // re-focus to avoid layout jumps
    setTimeout(() => inputRef.current && inputRef.current.focus(), 0);
  };

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        className={`border px-3 h-10 rounded-full w-full sm:w-64 ${inputClassName}`}
        value={value}
        onChange={(e) => {
          if (typeof onChange === 'function') onChange(e.target.value);
          else setValue(e.target.value);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            handleAdd(value);
          } else if (e.key === 'Backspace' && !value) {
            updateTokens(tokens.slice(0, Math.max(0, tokens.length - 1)));
          }
        }}
      />

      <div className="mt-2">
        {tokens && tokens.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tokens.map((t, i) => (
              <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                <span>{t}</span>
                <button onClick={() => updateTokens(tokens.filter(x => x !== t))} className="text-gray-500 hover:text-gray-700">×</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenSearch;
