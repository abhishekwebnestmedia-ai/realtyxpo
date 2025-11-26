import React, { useState } from "react";
import { Trash2 } from "lucide-react";
import ReactDOM from "react-dom";

const ConfirmDeleteButton = ({
  onConfirm,
  disabled = false,
  title = "Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  label = <Trash2 size={16} />,
  className = "text-red-600 hover:text-red-800",
}) => {
  const [open, setOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirm = async () => {
    if (typeof onConfirm !== "function") {
      setOpen(false);
      return;
    }

    try {
      setIsProcessing(true);
      await onConfirm();
      setOpen(false);
    } catch (err) {
      console.error("Delete confirmation failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <button
        className={`${className} disabled:opacity-50`}
        disabled={disabled || isProcessing}
        onClick={() => !disabled && setOpen(true)}
        title={typeof label === "string" ? label : "Delete"}
      >
        {label}
      </button>
      {open && ReactDOM.createPortal(
        <div 
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-2xl bg-white px-6 py-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              <div className="mt-1 rounded-full bg-red-50 p-2">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
                <p className="mt-1 text-sm text-gray-600">{message}</p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                onClick={() => setOpen(false)}
                disabled={isProcessing}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 rounded-lg bg-red-600 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50"
                onClick={handleConfirm}
                disabled={isProcessing}
              >
                {isProcessing ? "Deleting..." : confirmLabel}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default ConfirmDeleteButton;