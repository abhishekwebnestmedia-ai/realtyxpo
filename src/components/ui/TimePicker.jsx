import React, { useEffect, useState } from 'react';

// Simple 12-hour time picker: hour(01-12), minute(00-59), AM/PM
// Props:
// - name: form field name
// - value: string like '02:30 PM' (optional)
// - onChange: function(event) where event.target = { name, value }
// - id, className (applied to wrapper)
export default function TimePicker({ name, value = '', onChange, id, className }) {
  const [hour, setHour] = useState('12');
  const [minute, setMinute] = useState('00');
  const [ampm, setAmpm] = useState('AM');

  useEffect(() => {
    if (!value) return;
    // accept formats like '02:30 PM', '2:30 PM', '02:30PM', '14:30', '14:30:00+05:30', etc.
    const m12 = String(value).match(/^(\s*)(0?\d|1[0-2]):([0-5]\d)\s*(AM|PM|am|pm)\s*$/);
    if (m12) {
      setHour(String(m12[2]).padStart(2, '0'));
      setMinute(m12[3]);
      setAmpm(m12[4].toUpperCase());
      return;
    }
    const m24 = String(value).match(/^(\s*)([0-1]\d|2[0-3]):([0-5]\d)/);
    if (m24) {
      const hh = parseInt(m24[2], 10);
      const mm = m24[3];
      const am = hh >= 12 ? 'PM' : 'AM';
      const h12 = ((hh + 11) % 12) + 1;
      setHour(String(h12).padStart(2, '0'));
      setMinute(mm);
      setAmpm(am);
      return;
    }
  }, [value]);

  const triggerChange = (h, m, a) => {
    const val = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')} ${a}`;
    if (typeof onChange === 'function') {
      onChange({ target: { name, value: val } });
    }
  };

  const handleHour = (e) => {
    const v = e.target.value;
    setHour(v);
    triggerChange(v, minute, ampm);
  };
  const handleMinute = (e) => {
    const v = e.target.value;
    setMinute(v);
    triggerChange(hour, v, ampm);
  };
  const handleAmpm = (e) => {
    const v = e.target.value;
    setAmpm(v);
    triggerChange(hour, minute, v);
  };

  // build minute options for every minute from 01 to 60
  const minuteOptions = Array.from({ length: 60 }).map((_, i) => String((i + 1) % 60).padStart(2, '0'));
  const hourOptions = Array.from({ length: 12 }).map((_, i) => String(i + 1).padStart(2, '0'));

  return (
    <div id={id} className={className || 'flex gap-2'}>
      <select name={`${name}_hour`} value={hour} onChange={handleHour} className="border rounded px-2 py-1 bg-[#FAFBFC]">
        {hourOptions.map(h => <option key={h} value={h}>{h}</option>)}
      </select>
      <span className="self-center">:</span>
      <select name={`${name}_minute`} value={minute} onChange={handleMinute} className="border rounded px-2 py-1 bg-[#FAFBFC]">
        {minuteOptions.map(m => <option key={m} value={m}>{m}</option>)}
      </select>
      <select name={`${name}_ampm`} value={ampm} onChange={handleAmpm} className="border rounded px-2 py-1 bg-[#FAFBFC]">
        <option value="AM">AM</option>
        <option value="PM">PM</option>
      </select>
    </div>
  );
}
