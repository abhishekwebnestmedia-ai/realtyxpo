// Global first-character capitalizer
// Runs in capture phase so React sees the transformed value in its onChange handlers.
export function initFirstCharCapitalizer() {
  if (typeof window === 'undefined') return;
  if (window.__firstCharCapitalizerInitialized) return;
  window.__firstCharCapitalizerInitialized = true;

  const isTargetEditable = (el) => {
    if (!el) return false;
    if (el instanceof HTMLTextAreaElement) return true;
    if (el instanceof HTMLInputElement) {
      // Only apply to textual input types
      const allowed = ['text', 'search', 'url'];
      return allowed.includes(el.type);
    }
    // support contenteditable elements
    if (el.isContentEditable) return true;
    return false;
  };

  const transformValue = (el) => {
    try {
      if (!isTargetEditable(el)) return false;
      const value = el instanceof HTMLElement && el.isContentEditable ? el.innerText : el.value;
      if (!value || value.length === 0) return false;
      const first = value.charAt(0);
      const upper = first.toUpperCase();
      if (first === upper) return false;

      // preserve selection/caret
      let selStart = null;
      let selEnd = null;
      try {
        if (typeof el.selectionStart === 'number') {
          selStart = el.selectionStart;
          selEnd = el.selectionEnd;
        }
  } catch { /* ignore errors reading selection */ }

      const newValue = upper + value.slice(1);
      if (el.isContentEditable) {
        el.innerText = newValue;
      } else {
        el.value = newValue;
      }

      // restore caret (keep same offset)
      try {
        if (selStart !== null && typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(selStart, selEnd);
        }
  } catch { /* ignore */ }

      return true;
    } catch {
      return false;
    }
  };

  // Capture phase listener - runs before React's delegated handlers
  const onInputCapture = (ev) => {
    const t = ev.target;
    transformValue(t);
  };

  // Also handle paste (transform after paste completes)
  const onPasteCapture = (ev) => {
    const t = ev.target;
    // let the paste happen then transform on next tick
    setTimeout(() => transformValue(t), 0);
  };

  document.addEventListener('input', onInputCapture, true);
  document.addEventListener('paste', onPasteCapture, true);

  // For dynamic content, ensure cleanup on unload
  window.addEventListener('beforeunload', () => {
    try {
      document.removeEventListener('input', onInputCapture, true);
      document.removeEventListener('paste', onPasteCapture, true);
  } catch { /* ignore cleanup errors */ }
  });
}

export default initFirstCharCapitalizer;
