let handlers = null;

export function setModalHandlers(obj) {
  handlers = obj;
}

export async function showAlert(message, opts = {}) {
  if (handlers && typeof handlers.showAlert === 'function') {
    return handlers.showAlert(message, opts);
  }
  // fallback
  try {
    window.alert(message);
    return Promise.resolve();
  } catch {
    return Promise.resolve();
  }
}

export async function showConfirm(message, opts = {}) {
  if (handlers && typeof handlers.showConfirm === 'function') {
    return handlers.showConfirm(message, opts);
  }
  // fallback to native confirm
  try {
    const r = window.confirm(message);
    return Promise.resolve(Boolean(r));
  } catch {
    return Promise.resolve(false);
  }
}

export default { setModalHandlers, showAlert, showConfirm };