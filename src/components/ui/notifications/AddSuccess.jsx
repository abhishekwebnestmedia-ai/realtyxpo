// CustomToast.js
import { toast } from "react-toastify";
import React from "react";

const showToast = ({ message, type = "success", autoClose = 3000 }) => {
  toast(
    <div className="flex flex-col p-4 min-w-[20rem] bg-white rounded shadow-md border border-gray-200">
      <p className="text-base font-medium">{message}</p>
    </div>,
    {
      type, // "success", "error", "info", "warning", "default"
      position: "top-right",
      autoClose,
      closeOnClick: true,
      closeButton: true,
      hideProgressBar: false,
      className: "bg-transparent shadow-none p-0", // remove default toast wrapper styles
      bodyClassName: "p-0",
      style: { marginRight: "2rem" }, // margin from right edge
    }
  );
};


export default showToast;
