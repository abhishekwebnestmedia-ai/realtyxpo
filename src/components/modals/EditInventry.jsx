import React from "react";
import { useNavigate } from "react-router-dom";
import icon3 from "../../../public/icons/editinventry3.svg";
import icon2 from "../../../public/icons/editinventry2.svg";
import icon1 from "../../../public/icons/editinventry1.svg";
const EditOptionsPopup = ({ isOpen, onClose, id }) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-5 flex items-center justify-center z-50 ">
      <div className="bg-white rounded-2xl  w-full max-w-lg py-10 px-20 relative flex flex-col gap-4">
        {/* Header */}
        <h2 className="text-2xl font-semibold mb-2 text-center">
          Select Editing Feild
        </h2>

        {/* Buttons */}
        <div className="grid grid-cols-3 gap-3">
          <div
            className="flex flex-col items-center gap-4 hover:cursor-pointer"
            onClick={() => {
              navigate(`/inventory/seller-details/${id}`);
              onClose();
            }}
          >
            <img src={icon1} alt="" className="w-full" />
            <button className="text-lg">Seller Details</button>
          </div>

          <div
            className="flex flex-col items-center gap-4 hover:cursor-pointer"
            onClick={() => {
              navigate(`/inventory/project-details/${id}`);
              onClose();
            }}
          >
            <img src={icon2} alt="" className="w-full" />
            <button className="text-lg">Project Details</button>
          </div>

          <div
            className="flex flex-col items-center gap-4 hover:cursor-pointer"
            onClick={() => {
              navigate(`/inventory/employee-details/${id}`);
              onClose();
            }}
          >
            <img src={icon3} alt="" className="w-full" />
            <button className="text-lg">Employee Details</button>
          </div>
        </div>

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

export default EditOptionsPopup;
