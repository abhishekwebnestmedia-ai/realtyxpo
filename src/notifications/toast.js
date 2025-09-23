// src/components/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Optional: configure defaults
toast.configure({
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  progress: undefined,
});

export const showSuccess = (msg) => {
  toast.success(msg);
};

export const showError = (msg) => {
  toast.error(msg);
};

export const showInfo = (msg) => {
  toast.info(msg);
};

export const showWarning = (msg) => {
  toast.warning(msg);
};
