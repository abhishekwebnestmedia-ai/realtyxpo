import React, { useState } from 'react';
import { X, Edit2 } from 'lucide-react';
import EditUnitModal from './EditUnitModal';

// Project-specific Unit Info modal — lightweight, used in Project Working views
const ProjectUnitModal = ({ isOpen, onClose, unit, onUpdated }) => {
  const [isEditOpen, setIsEditOpen] = useState(false);

  if (!isOpen || !unit) return null;

  const displayPhones = (unit.mobileNumbers && unit.mobileNumbers.length)
    ? unit.mobileNumbers.join(', ')
    : (unit.contactNumbers && unit.contactNumbers.length) ? unit.contactNumbers.join(', ') : '—';

  const normalizeStatus = (s) => {
    if (!s && s !== 0) return s;
    const v = String(s).toLowerCase().trim();
    if (!v) return s;
    if (v.includes('interested')) return 'Interested';
    return String(s);
  };

  return (
    <>
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-2xl shadow-xl w-[560px] max-h-[90vh] overflow-y-auto p-6 relative unit-modal-scroll">
          <style>{`.unit-modal-scroll::-webkit-scrollbar{display:none} .unit-modal-scroll{scrollbar-width:none; -ms-overflow-style:none;}`}</style>
          <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-800"><X /></button>

          <h2 className="text-2xl font-bold mb-2">Unit {unit.unitNumber || unit.unitNo || unit._id}</h2>

          <div className="text-sm text-gray-700 mb-4">
            <div className="mb-2"><strong>Owner:</strong> {unit.ownerName || unit.sellerName || '—'}</div>
            <div className="mb-2"><strong>Contact:</strong> {displayPhones}</div>
            <div className="mb-2"><strong>Status:</strong> {normalizeStatus(unit.status)}</div>
            {unit.typology && <div className="mb-2"><strong>Typology:</strong> {Array.isArray(unit.typology) ? unit.typology.join(', ') : unit.typology}</div>}
            {unit.size && <div className="mb-2"><strong>Size:</strong> {unit.size}</div>}
            {unit.remarks && <div className="mb-2"><strong>Remarks:</strong> {unit.remarks}</div>}
          </div>

          <div className="flex justify-end gap-3 border-t pt-4 mt-4">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">Close</button>

            <button
              onClick={() => setIsEditOpen(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center gap-2"
            >
              <Edit2 size={16} />
              Edit
            </button>
          </div>
        </div>
      </div>

      <EditUnitModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        unit={unit}
        onSuccess={() => {
          // notify parent to refresh list or re-fetch unit
          onUpdated?.();
          setIsEditOpen(false);
          onClose?.();
        }}
      />
    </>
  );
};

export default ProjectUnitModal;
