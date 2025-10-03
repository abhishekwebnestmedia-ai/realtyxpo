// src/components/toast.js
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Toast helper functions with default options
const defaultOptions = {
  position: "top-right",
  autoClose: 3000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
};

export const showSuccess = (msg, options = {}) => {
  toast.success(msg, { ...defaultOptions, ...options });
};

export const showError = (msg, options = {}) => {
  toast.error(msg, { ...defaultOptions, ...options });
};

export const showInfo = (msg, options = {}) => {
  toast.info(msg, { ...defaultOptions, ...options });
};

export const showWarning = (msg, options = {}) => {
  toast.warning(msg, { ...defaultOptions, ...options });
};
