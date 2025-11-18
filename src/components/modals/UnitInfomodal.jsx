import React, { useState } from "react";
import { X } from "lucide-react";
import dayjs from "dayjs";
import api from "../../api/api";
import { toast } from "react-hot-toast";

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
    unitNumber,
    unitId,
    ownerName,
    mobileNumbers,
    contactNumbers,
    status,
    sellerName,
    typology,
    city: _city,
    division: _division,
    sector: _sector,
    project: _project,
    tower: _tower,
    cityId: topCityId,
    divisionId: topDivisionId,
    sectorId: topSectorId,
    projectId: topProjectId,
    towerId: topTowerId,
    meta = {},
  } = unit || {};

  // Support callers that pass `unit` as the `meta` object directly (e.g. NotificationsPanel passes modalNotif.meta)
  const effectiveMeta = (meta && Object.keys(meta).length > 0) ? meta : (unit || {});

  const resolvedIds = {
    cityId: topCityId || effectiveMeta.cityId || effectiveMeta.city?.id,
    divisionId: topDivisionId || effectiveMeta.divisionId || effectiveMeta.division?.id,
    sectorId: topSectorId || effectiveMeta.sectorId || effectiveMeta.sector?.id,
    projectId: topProjectId || effectiveMeta.projectId || effectiveMeta.project?.id,
    towerId: topTowerId || effectiveMeta.towerId || effectiveMeta.tower?.id,
    unitId: unitId || effectiveMeta.unitId || effectiveMeta._id || effectiveMeta.id,
    category: category || effectiveMeta.category,
    projectcategory: projectcategory || effectiveMeta.projectcategory,
  };

  const displayPhones =
    mobileNumbers?.length
      ? mobileNumbers.join(", ")
      : contactNumbers?.length
      ? contactNumbers.join(", ")
      : "—";

  // Helper to convert any shape into displayable name
  const resolveName = (val) => {
    if (val == null) return null;
    if (typeof val === "string") return val;
    if (typeof val === "number") return String(val);
    if (Array.isArray(val))
      return val.map((v) => resolveName(v)).filter(Boolean).join(", ");
    if (typeof val === "object") {
      return (
        val.name ||
        val.cityName ||
        val.divisionName ||
        val.sectorName ||
        val.projectName ||
        val.towerName ||
        val.unitNumber ||
        val.unitNo ||
        val.title ||
        val.label ||
        val.value ||
        val.displayName ||
        null
      );
    }
    return null;
  };

  // breadcrumb builder using exact backend meta keys
  const breadcrumbParts = (() => {
    const m = effectiveMeta || {};
    const parts = [];
    const c = m.cityName || m.city || (_city && (_city.name || _city));
    const d = m.divisionName || m.division || (_division && (_division.name || _division));
    const s = m.sectorName || m.sector || (_sector && (_sector.name || _sector));
    const p = m.projectName || m.project || (_project && (_project.name || _project));
    const t = m.towerName || m.tower || (_tower && (_tower.name || _tower));
    const u = m.unitNumber || unitNumber || (unit && (unit.unitNo || unit.unit));

    if (c) parts.push(`City: ${resolveName(c)}`);
    if (d) parts.push(`Division: ${resolveName(d)}`);
    if (s) parts.push(`Sector: ${resolveName(s)}`);
    if (p) parts.push(`Project: ${resolveName(p)}`);
    if (t) parts.push(`Tower: ${resolveName(t)}`);
    if (u) parts.push(`Unit: ${resolveName(u)}`);

    return parts;
  })();

  // FINAL breadcrumb → Names only
  const breadcrumb = breadcrumbParts.join(" / ");

  // Heading title: prefer project name (from meta or top-level), fall back to unit label
  const headerTitle = (() => {
    const m = effectiveMeta || {};
    if (m.projectName) return resolveName(m.projectName);
    if (_project) return resolveName(_project);
    return (
      unitNumber || unit.unitNo || unit.unit || `Unit ${unitId || resolvedIds.unitId || ""}`
    );
  })();

  const normalizeStatus = (s) => {
    if (!s && s !== 0) return s;
    const v = String(s).toLowerCase().trim();
    if (!v) return s;
    if (
      v.includes("interested") ||
      v.includes("interested in calling") ||
      v.includes("interested in selling")
    )
      return "For Sale";
    if (v === "for sale" || v === "sale" || v === "selling")
      return "For Sale";
    return String(s);
  };

  return (
    <div
      data-notif-modal
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl shadow-xl w-[520px] max-h-[90vh] overflow-y-auto p-6 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Title */}
        <h2 className="text-2xl font-bold mb-2 text-gray-800">{headerTitle}</h2>

        {/* Breadcrumb */}
        {breadcrumb && (
          <p className="text-sm text-gray-500 mb-4">{breadcrumb}</p>
        )}

        {/* OWNER / CONTACT / STATUS */}
        <div className="flex flex-wrap items-center gap-6 text-sm text-gray-700">
          {hasValue(ownerName || unit.ownerName) && (
            <div>
              <strong className="font-medium">Owner:</strong>{" "}
              <span className="ml-1">{ownerName || unit.ownerName}</span>
            </div>
          )}

          <div>
            <strong className="font-medium">Contact:</strong>{" "}
            <span className="ml-1">{displayPhones}</span>
          </div>

          {hasValue(status || unit.status) && (
            <div>
              <strong className="font-medium">Status:</strong>{" "}
              <span className="ml-1">
                {normalizeStatus(status || unit.status)}
              </span>
            </div>
          )}
        </div>


        {/* Additional Fields */}
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
          {hasValue(typology || unit.typology) && (
            <div>
              <strong className="font-medium">Typology:</strong>{" "}
              <span className="ml-1">
                {safeJoin(typology || unit.typology)}
              </span>
            </div>
          )}
          {hasValue(sellerName || unit.sellerName) && (
            <div>
              <strong className="font-medium">Seller:</strong>{" "}
              <span className="ml-1">{sellerName || unit.sellerName}</span>
            </div>
          )}
        </div>

        {/* FOOTER */}
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
