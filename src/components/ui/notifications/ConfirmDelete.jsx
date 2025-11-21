import React from "react";
import { toast } from "react-hot-toast";
import { Trash2 } from "lucide-react";

const ConfirmDeleteButton = ({
  onConfirm,
  disabled = false,
  title = "Delete",
  message = "Are you sure you want to delete this item? This action cannot be undone.",
  confirmLabel = "Delete",
  label = <Trash2 size={16} />,
  className = "text-red-600 hover:text-red-800",
}) => {
  const handleClick = () => {
    toast((t) => (
      <div className="flex flex-col min-w-[28rem] p-4 bg-white rounded-2xl border border-gray-200 shadow">
        <div className="flex items-start gap-4">
          <div className="pt-1">
            <Trash2 size={28} color="red" />
          </div>
          <div>
            <h2 className="text-base font-semibold">{title}</h2>
            <p className="text-sm mt-1 text-gray-600">{message}</p>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-4">
          <button
            className="px-3 py-1 bg-gray-200 rounded text-sm"
            onClick={() => toast.dismiss(t.id)}
          >
            Cancel
          </button>
          <button
            className="px-3 py-1 bg-red-600 text-white rounded text-sm"
            onClick={() => {
              try {
                if (typeof onConfirm === 'function') onConfirm();
              } finally {
                toast.dismiss(t.id);
              }
            }}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    ), { duration: Infinity });
  };

  return (
    <button
      className={`${className} disabled:opacity-50`}
      disabled={disabled}
      onClick={handleClick}
      title={typeof label === 'string' ? label : 'Delete'}
    >
      {label}
    </button>
  );
};

export default ConfirmDeleteButton;