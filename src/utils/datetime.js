// Utilities for robust local timestamp parsing and formatting

export const parseLocalTimestamp = (value) => {
  try {
    if (value === null || value === undefined) return null;

    if (value instanceof Date) {
      const t = value.getTime();
      return Number.isNaN(t) ? null : t;
    }

    if (typeof value === 'number') {
      // seconds vs ms
      return String(value).length === 10 ? value * 1000 : value;
    }

    const s = String(value).trim();
    if (!s) return null;

    // timezone-aware → defer to native Date
    if (/([zZ]|[+-]\d{2}:?\d{2})$/.test(s)) {
      const d = new Date(s);
      const t = d.getTime();
      return Number.isNaN(t) ? null : t;
    }

    // ISO-like without timezone; accept 'T' or space between date and time
    const m = s.match(/^(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2})(?::(\d{2}))?$/);
    if (m) {
      const year = parseInt(m[1], 10);
      const month = parseInt(m[2], 10) - 1;
      const day = parseInt(m[3], 10);
      const hour = parseInt(m[4], 10);
      const minute = parseInt(m[5], 10);
      const second = m[6] ? parseInt(m[6], 10) : 0;
      const d = new Date(year, month, day, hour, minute, second);
      const t = d.getTime();
      return Number.isNaN(t) ? null : t;
    }

    // numeric-like string
    const num = Number(s);
    if (!Number.isNaN(num)) {
      return s.length === 10 ? num * 1000 : num;
    }

    const d = new Date(s);
    const t = d.getTime();
    return Number.isNaN(t) ? null : t;
  } catch {
    return null;
  }
};

export const toLocalDate = (value) => {
  const ts = parseLocalTimestamp(value);
  return ts == null ? null : new Date(ts);
};

export const formatLocalTimestamp = (value, opts = {}) => {
  const d = toLocalDate(value);
  if (!d) return '';
  // Always format in IST (Indian Standard Time = UTC+5:30)
  const defaultOpts = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Kolkata', // IST timezone
  };
  return d.toLocaleString('en-IN', { ...defaultOpts, ...opts });
};

// Helper: Convert any timestamp to IST and return as "YYYY-MM-DD HH:mm:ss" format
export const toISTString = (value) => {
  const d = toLocalDate(value);
  if (!d) return '';
  
  // Use Intl API to get IST time components
  const formatter = new Intl.DateTimeFormat('en-CA', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
    timeZone: 'Asia/Kolkata'
  });

  const parts = formatter.formatToParts(d);
  const map = {};
  for (const part of parts) {
    if (part.type !== 'literal') {
      map[part.type] = part.value;
    }
  }

  return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
};
