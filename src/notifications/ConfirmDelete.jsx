import React from "react";
import { toast } from "react-toastify";
import { Trash2 } from "lucide-react";

const ConfirmDeleteButton = ({ onConfirm, disabled }) => {
  const handleClick = () => {
  toast(
  ({ closeToast }) => (
    <div className="flex flex-col min-w-[30rem] p-4 bg-white rounded-2xl border border-gray-200">
      <div className="flex items-start gap-6">
        <Trash2 size={32} color="red"/>
        <div className="">
          <h2 className="text-base font-semibold">Delete Lead</h2>
      <p className="text-base mt-1">
        Are you sure you want to delete this post? This action cannot be undone.
      </p>
        </div>
      </div>
      <div className="flex justify-end gap-2 mt-4">
        <button
          className="px-3 py-1 bg-gray-300 rounded"
          onClick={closeToast}
        >
          Cancel
        </button>
        <button
          className="px-3 py-1 bg-red-600 text-white rounded"
          onClick={() => {
            onConfirm();
            closeToast();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  ),
  {
    autoClose: false,
    closeOnClick: false,
    closeButton: false,
    type: "default",
    className: "bg-transparent shadow-none p-0", // remove wrapper styles
    bodyClassName: "p-0",
    position: "top-right", // default, but we’ll add margin
    style: { marginRight: "10.3rem" }, // ← this adds margin from the right edge
  }
);


  };

  return (
    <button
      className="text-red-600 hover:text-red-800 disabled:opacity-50"
      disabled={disabled}
      onClick={handleClick}
    >
      <Trash2 size={16} />
    </button>
  );
};

export default ConfirmDeleteButton;
