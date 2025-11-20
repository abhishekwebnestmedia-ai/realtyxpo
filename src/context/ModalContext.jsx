import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import { createPortal } from 'react-dom';
import { setModalHandlers } from '../services/modalService';

const ModalContext = createContext(null);

export function ModalProvider({ children }) {
  const [modalState, setModalState] = useState({ open: false, type: null, message: '' });
  const resolveRef = useRef(null);

  const showAlert = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModalState({ open: true, type: 'alert', message, opts });
    });
  }, []);

  const showConfirm = useCallback((message, opts = {}) => {
    return new Promise((resolve) => {
      resolveRef.current = resolve;
      setModalState({ open: true, type: 'confirm', message, opts });
    });
  }, []);

  const close = useCallback((result) => {
    const resolver = resolveRef.current;
    resolveRef.current = null;
    setModalState({ open: false, type: null, message: '' });
    if (typeof resolver === 'function') resolver(result);
  }, []);

  // register handlers to modalService so non-react code can call them
  React.useEffect(() => {
    setModalHandlers({ showAlert, showConfirm });
  }, [showAlert, showConfirm]);

  return (
    <ModalContext.Provider value={{ showAlert, showConfirm }}>
      {children}
      {modalState.open && (
        <ModalShell state={modalState} onClose={close} />
      )}
    </ModalContext.Provider>
  );
}

export function useModal() {
  const ctx = useContext(ModalContext);
  if (!ctx) {
    return {
      showAlert: (m) => Promise.resolve(window.alert(m)),
      showConfirm: (m) => Promise.resolve(window.confirm(m)),
    };
  }
  return ctx;
}

function ModalShell({ state, onClose }) {
  // create a portal attached to document.body
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40" onClick={() => onClose(false)} />
      <div className="relative w-full max-w-lg mx-4">
        <div className="bg-white rounded shadow-lg p-6">
          <div className="mb-4 text-gray-800 whitespace-pre-wrap">{state.message}</div>
          <div className="flex justify-end gap-3">
            {state.type === 'confirm' && (
              <>
                <button
                  type="button"
                  className="px-4 py-2 rounded border"
                  onClick={() => onClose(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="px-4 py-2 rounded bg-red-600 text-white"
                  onClick={() => onClose(true)}
                >
                  Delete
                </button>
              </>
            )}
            {state.type === 'alert' && (
              <button
                type="button"
                className="px-4 py-2 rounded bg-primary text-white"
                onClick={() => onClose(true)}
              >
                OK
              </button>
            )}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
