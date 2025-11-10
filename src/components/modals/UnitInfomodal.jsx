import React from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";

const UnitInfoModal = ({ isOpen, onClose, unit }) => {
  if (!isOpen || !unit) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-2xl shadow-xl w-[480px] max-h-[90vh] overflow-y-auto p-6 relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
         {unit.unitNumber}
        </h2>

        <div className="space-y-3 text-gray-700">
          <p>
            <strong>Owner Name:</strong> {unit.ownerName || "—"}
          </p>

          <p>
            <strong>Mobile Numbers:</strong>{" "}
            {unit.mobileNumbers && unit.mobileNumbers.length > 0
              ? unit.mobileNumbers.join(", ")
              : "—"}
          </p>

          <p>
            <strong>Email:</strong> {unit.email || "—"}
          </p>

          {/* <p>
            <strong>Follow-up Date:</strong>{" "}
            {unit.followUpDate
              ? dayjs(unit.followUpDate).format("DD MMM YYYY")
              : "—"}
          </p> */}

          <p>
            <strong>Status:</strong>{" "}
            <span className="capitalize">{unit.status || "—"}</span>
          </p>

          <p>
            <strong>Remarks:</strong> {unit.remarks || "—"}
          </p>
        </div>
      </div>
    </div>
  );
};

export default UnitInfoModal;
