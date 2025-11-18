// import React, { useState } from "react";
// import { X } from "lucide-react";
// import dayjs from "dayjs";
// import api from '../../api/api';
// import { toast } from 'react-hot-toast';

// const Field = ({ label, value }) => (
//   <p>
//     <strong>{label}:</strong> {value}
//   </p>
// );

// const hasValue = (v) => {
//   if (v == null) return false;
//   if (typeof v === 'string') return v.trim().length > 0;
//   if (Array.isArray(v)) return v.length > 0;
//   if (typeof v === 'object') return Object.keys(v).length > 0;
//   return true; // numbers, booleans
// };

// const UnitInfoModal = ({ isOpen, onClose, unit, onConfirm, confirmLoading = false, confirmText = 'Approve' }) => {
//   const [loading, setLoading] = useState(false);
//   if (!isOpen || !unit) return null;

//   // Map common meta keys which may be present in notification.meta
//   const {
//     category,
//     projectcategory,
//     city,
//     division,
//     sector,
//     project,
//     tower,
//     unitNumber,
//     unitId,
//     ownerName,
//     mobileNumbers,
//     contactNumbers,
//     email,
//     status,
//     remarks,
//     followUpDate,
//     sellerName,
//     typology,
//     paymentStatus,
//     source,
//     createdAt,
//     // possible id fields at the top-level
//     cityId: topCityId,
//     divisionId: topDivisionId,
//     sectorId: topSectorId,
//     projectId: topProjectId,
//     towerId: topTowerId,
//     meta = {}
//   } = unit || {};

//   // Resolve IDs: prefer top-level id fields, fallback to meta.*
//   const resolvedIds = {
//     cityId: topCityId || meta.cityId || meta.city?.id || meta.cityId?.toString(),
//     divisionId: topDivisionId || meta.divisionId || meta.division?.id,
//     sectorId: topSectorId || meta.sectorId || meta.sector?.id,
//     projectId: topProjectId || meta.projectId || meta.project?.id,
//     towerId: topTowerId || meta.towerId || meta.tower?.id,
//     unitId: unitId || meta.unitId || meta._id || meta.id,
//     category: category || meta.category,
//     projectcategory: projectcategory || meta.projectcategory
//   };

//   const displayPhones = (mobileNumbers && mobileNumbers.length) ? mobileNumbers.join(', ') : (contactNumbers && contactNumbers.length ? contactNumbers.join(', ') : '—');

//   return (
//     <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
//       <div className="bg-white rounded-2xl shadow-xl w-[520px] max-h-[90vh] overflow-y-auto p-6 relative">
//         {/* Close Button */}
//         <button
//           onClick={onClose}
//           className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
//         >
//           <X className="w-6 h-6" />
//         </button>

//         {/* Title */}
//         <h2 className="text-2xl font-bold mb-4 text-gray-800">
//          {unitNumber || unit.unitNo || unit.unit || `Unit ${unitId ?? ''}`}
//         </h2>

//         <div className="space-y-2 text-gray-700">
//           {hasValue(projectcategory || category) && (
//             <Field label="Project Category" value={projectcategory || category} />
//           )}
//           {hasValue(city && (city.name || city)) && (
//             <Field label="City" value={city.name || city} />
//           )}
//           {hasValue(division && (division.name || division)) && (
//             <Field label="Division" value={division.name || division} />
//           )}
//           {hasValue(sector && (sector.name || sector)) && (
//             <Field label="Sector" value={sector.name || sector} />
//           )}
//           {hasValue(project && (project.name || project)) && (
//             <Field label="Project" value={project.name || project} />
//           )}
//           {hasValue(tower && (tower.name || tower)) && (
//             <Field label="Tower" value={tower.name || tower} />
//           )}
//           {hasValue(unitNumber || unit.unitNo || unit.unit || unitId) && (
//             <Field label="Unit No" value={unitNumber || unit.unitNo || unit.unit || unitId} />
//           )}
//           {hasValue(ownerName || unit.ownerName) && (
//             <Field label="Owner Name" value={ownerName || unit.ownerName} />
//           )}
//           {hasValue(displayPhones) && (
//             <Field label="Contact" value={displayPhones} />
//           )}
//           {hasValue(email || unit.email) && (
//             <Field label="Email" value={email || unit.email} />
//           )}
//           {hasValue(status || unit.status) && (
//             <Field label="Status" value={status || unit.status} />
//           )}
//           {hasValue(sellerName || unit.sellerName) && (
//             <Field label="Seller" value={sellerName || unit.sellerName} />
//           )}
//           {hasValue(typology || unit.typology) && (
//             <Field label="Typology" value={(Array.isArray(typology) ? typology : unit.typology).join(', ')} />
//           )}
//           {hasValue(paymentStatus || unit.paymentStatus) && (
//             <Field label="Payment Status" value={(Array.isArray(paymentStatus) ? paymentStatus : unit.paymentStatus).join(', ')} />
//           )}
//           {hasValue(source || unit.source) && (
//             <Field label="Source" value={(Array.isArray(source) ? source : unit.source).join(', ')} />
//           )}
//           {hasValue(remarks || unit.remarks) && (
//             <Field label="Remarks" value={remarks || unit.remarks} />
//           )}
//           {hasValue(followUpDate || unit.followUpDate) && (
//             <Field label="Follow-up" value={dayjs(followUpDate || unit.followUpDate).format('DD MMM YYYY, HH:mm')} />
//           )}
//           {hasValue(createdAt || unit.createdAt) && (
//             <Field label="Created At" value={dayjs(createdAt || unit.createdAt).format('DD MMM YYYY, HH:mm')} />
//           )}
//         </div>

//         {/* Footer with optional confirm action. NOTE: This confirm button should NOT perform API calls directly; it only triggers the provided onConfirm callback which is expected to be non-networking (per UX requirement). */}
//         {typeof onConfirm === 'function' && (
//           <div className="mt-6 flex justify-end gap-3 border-t pt-4">
//             <button
//               onClick={onClose}
//               className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
//             >
//               Cancel
//             </button>
//             <button
//               onClick={async () => {
             
//                 // When the modal confirm is clicked, call the approve-unit API using the unit meta
//                 try {
//                   // If parent provided an onConfirm handler, allow it to run first (optional)
//                   // but primary action here is to call the approve API.
//                   const {
//                     cityId,
//                     divisionId,
//                     sectorId,
//                     projectId,
//                     towerId,
//                     unitId: resolvedUnitId,
//                     category: resolvedCategory,
//                     projectcategory: resolvedProjectCategory
//                   } = resolvedIds;
                 
//                   setLoading(true);
//                   const path = `/projects/approve-unit/${resolvedCategory}/${resolvedProjectCategory}/${cityId}/${divisionId}/${sectorId}/${projectId}/${towerId}/${resolvedUnitId}`;
//                   const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
//                   const headers = token ? { Authorization: `Bearer ${token}` } : {};
//                   const resp = await api.post(path, { confirm: 'yes' }, { headers });
//                   toast.success(resp.data?.message || 'Unit approved and copied to inventory');
//                   // call parent handler with response so it can mark read / navigate
//                   if (typeof onConfirm === 'function') await onConfirm(resp.data);
//                   // fallback close
//                   if (typeof onClose === 'function') onClose();
//                 } catch (err) {
//                   console.error('Approve unit failed', err);
//                   toast.error(err?.response?.data?.error || 'Approval failed');
//                 } finally {
//                   setLoading(false);
//                 }
//               }}
//               disabled={loading || confirmLoading}
//               className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
//             >
//               {loading || confirmLoading ? 'Processing...' : confirmText}
//             </button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default UnitInfoModal;




import React, { useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";
import api from "../../api/api";
import { toast } from "react-hot-toast";

const Field = ({ label, value }) => (
  <p>
    <strong>{label}:</strong> {value}
  </p>
);

const hasValue = (v) => {
  if (v == null) return false;
  if (typeof v === "string") return v.trim().length > 0;
  if (Array.isArray(v)) return v.length > 0;
  if (typeof v === "object") return Object.keys(v).length > 0;
  return true;
};

const safeJoin = (value) => {
  if (!value) return "";
  if (Array.isArray(value)) return value.join(", ");
  return String(value);
};

/**
 * FINAL VERSION
 * - Works with: isOpen, onClose, unit
 * - Approve button does NOT close modal
 * - Only Cancel or X closes modal
 */
const UnitInfoModal = ({
  isOpen,
  onClose,
  unit,
  onConfirm,
  confirmLoading = false,
  confirmText = "Approve",
}) => {
  const [loading, setLoading] = useState(false);

  if (!isOpen || !unit) return null;

  const {
    category,
    projectcategory,
    city,
    division,
    sector,
    project,
    tower,
    unitNumber,
    unitId,
    ownerName,
    mobileNumbers,
    contactNumbers,
    email,
    status,
    remarks,
    followUpDate,
    sellerName,
    typology,
    paymentStatus,
    source,
    createdAt,
    cityId: topCityId,
    divisionId: topDivisionId,
    sectorId: topSectorId,
    projectId: topProjectId,
    towerId: topTowerId,
    meta = {},
  } = unit || {};

  const resolvedIds = {
    cityId: topCityId || meta.cityId || meta.city?.id,
    divisionId: topDivisionId || meta.divisionId || meta.division?.id,
    sectorId: topSectorId || meta.sectorId || meta.sector?.id,
    projectId: topProjectId || meta.projectId || meta.project?.id,
    towerId: topTowerId || meta.towerId || meta.tower?.id,
    unitId: unitId || meta.unitId || meta._id || meta.id,
    category: category || meta.category,
    projectcategory: projectcategory || meta.projectcategory,
  };

  const displayPhones =
    mobileNumbers?.length
      ? mobileNumbers.join(", ")
      : contactNumbers?.length
      ? contactNumbers.join(", ")
      : "—";

  const normalizeStatus = (s) => {
    if (!s && s !== 0) return s;
    const v = String(s).toLowerCase().trim();
    if (!v) return s;
    // map old/varied labels to a consistent display
    if (v.includes('interested') || v.includes('interested in calling') || v.includes('interested in selling')) return 'For Sale';
    if (v === 'for sale' || v === 'sale' || v === 'selling') return 'For Sale';
    // keep original casing for other values
    return String(s);
  };

  return (
    <div data-notif-modal className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-[520px] max-h-[90vh] overflow-y-auto p-6 relative">
        
        {/* Close (X) */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          {unitNumber ||
            unit.unitNo ||
            unit.unit ||
            `Unit ${unitId || resolvedIds.unitId || ""}`}
        </h2>

        <div className="space-y-2 text-gray-700">
          {hasValue(projectcategory || category) && (
            <Field label="Project Category" value={projectcategory || category} />
          )}

          {hasValue(city?.name || city) && (
            <Field label="City" value={city?.name || city} />
          )}

          {hasValue(division?.name || division) && (
            <Field label="Division" value={division?.name || division} />
          )}

          {hasValue(sector?.name || sector) && (
            <Field label="Sector" value={sector?.name || sector} />
          )}

          {hasValue(project?.name || project) && (
            <Field label="Project" value={project?.name || project} />
          )}

          {hasValue(tower?.name || tower) && (
            <Field label="Tower" value={tower?.name || tower} />
          )}

          <Field
            label="Unit No"
            value={
              unitNumber || unit.unitNo || unit.unit || unitId || resolvedIds.unitId
            }
          />

          {hasValue(ownerName || unit.ownerName) && (
            <Field label="Owner Name" value={ownerName || unit.ownerName} />
          )}

          <Field label="Contact" value={displayPhones} />

          {hasValue(email || unit.email) && (
            <Field label="Email" value={email || unit.email} />
          )}

          {hasValue(status || unit.status) && (
            <Field label="Status" value={normalizeStatus(status || unit.status)} />
          )}

          {hasValue(sellerName || unit.sellerName) && (
            <Field label="Seller" value={sellerName || unit.sellerName} />
          )}

          {hasValue(typology || unit.typology) && (
            <Field label="Typology" value={safeJoin(typology || unit.typology)} />
          )}

          {hasValue(paymentStatus || unit.paymentStatus) && (
            <Field
              label="Payment Status"
              value={safeJoin(paymentStatus || unit.paymentStatus)}
            />
          )}

          {hasValue(source || unit.source) && (
            <Field label="Source" value={safeJoin(source || unit.source)} />
          )}

          {hasValue(remarks || unit.remarks) && (
            <Field label="Remarks" value={remarks || unit.remarks} />
          )}

          {(followUpDate || unit.followUpDate) && (
            <Field
              label="Follow-up"
              value={dayjs(followUpDate || unit.followUpDate).format(
                "DD MMM YYYY, HH:mm"
              )}
            />
          )}

          {(createdAt || unit.createdAt) && (
            <Field
              label="Created At"
              value={dayjs(createdAt || unit.createdAt).format(
                "DD MMM YYYY, HH:mm"
              )}
            />
          )}
        </div>

        {/* Footer */}
        {typeof onConfirm === "function" && (
          <div className="mt-6 flex justify-end gap-3 border-t pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
            >
              Cancel
            </button>

            <button
              onClick={async () => {
                try {
                  const {
                    cityId,
                    divisionId,
                    sectorId,
                    projectId,
                    towerId,
                    unitId: resolvedUnitId,
                    category: resolvedCategory,
                    projectcategory: resolvedProjectCategory,
                  } = resolvedIds;

                  setLoading(true);

                  const path = `/projects/approve-unit/${resolvedCategory}/${resolvedProjectCategory}/${cityId}/${divisionId}/${sectorId}/${projectId}/${towerId}/${resolvedUnitId}`;

                  const token =
                    typeof window !== "undefined"
                      ? localStorage.getItem("token")
                      : null;

                  const headers = token
                    ? { Authorization: `Bearer ${token}` }
                    : {};

                  const resp = await api.post(
                    path,
                    { confirm: "yes" },
                    { headers }
                  );

                  toast.success(resp.data?.message || "Unit approved");

                  if (typeof onConfirm === "function") {
                    await onConfirm(resp.data);
                  }

                } catch (err) {
                  console.error("Approve unit failed", err);
                  toast.error(err?.response?.data?.error || "Approval failed");
                } finally {
                  setLoading(false);
                }
              }}
              disabled={loading || confirmLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
            >
              {loading || confirmLoading ? "Processing..." : confirmText}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UnitInfoModal;
