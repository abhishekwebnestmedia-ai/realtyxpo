import React, { useState } from 'react';
import { X, Building2, Phone, CheckCircle2, ShieldAlert } from 'lucide-react';
import { toast } from 'react-hot-toast';
import api from '../../api/api';
import { formatLocalTimestamp } from '../../utils/datetime';

const InfoRow = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
    <span className="text-sm font-semibold text-slate-900">{value || '—'}</span>
  </div>
);






















const InventoryApprovalModal = ({ notification, isOpen, onClose, onApproved, onDismiss }) => {
  const [submitting, setSubmitting] = useState(false);

  const meta = notification?.meta || {};
  const hierarchy = meta.hierarchy || {};
  const requestedBy = meta.requestedBy;
  const unitSnapshot = meta.unit || {};
  const statusLabel = meta.targetType === 'Rent' ? 'Rental' : 'For Sale';

  

  const parts = [];
  if (hierarchy.cityName) parts.push(hierarchy.cityName);
  if (hierarchy.divisionName) parts.push(hierarchy.divisionName);
  if (hierarchy.sectorName) parts.push(hierarchy.sectorName);
  if (hierarchy.projectName) parts.push(hierarchy.projectName);
  if (hierarchy.towerName) parts.push(hierarchy.towerName);
  if (hierarchy.unitNumber) parts.push(hierarchy.unitNumber);
  const breadcrumb = parts.join(' • ');

  if (!isOpen || !notification) return null;

  const handleApprove = async () => {
      const category = meta.category || hierarchy.category;
      const projectcategory = meta.projectcategory || hierarchy.projectcategory;
      if (!category || !projectcategory) {
        toast.error('Missing category/projectcategory in notification meta');
        return;
      }

    setSubmitting(true);
    try {
      // prefer hierarchy.unitId, fall back to meta.unit._id, meta.unitId, or snapshot _id
      const unitId = hierarchy.unitId || meta.unit?._id || meta.unitId || unitSnapshot._id || '';
      if (!unitId) {
        toast.error('Missing unit id in notification meta; cannot approve');
        setSubmitting(false);
        return;
      }

      // backend expects: cityId / divisionId / sectorId / projectId / towerId / unitId
      const path = `/projects/approve-unit/${encodeURIComponent(category)}/${encodeURIComponent(projectcategory)}/${encodeURIComponent(hierarchy.cityId || '')}/${encodeURIComponent(hierarchy.divisionId || '')}/${encodeURIComponent(hierarchy.sectorId || '')}/${encodeURIComponent(hierarchy.projectId || '')}/${encodeURIComponent(hierarchy.towerId || '')}/${encodeURIComponent(unitId)}`;
      const resp = await api.post(path, { confirm: 'yes', notificationId: notification._id });
      toast.success(resp.data?.message || 'Unit approved and moved to inventory');
      onApproved?.(resp.data);
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      toast.error(msg || 'Approval failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDismiss = async () => {
    try {
      if (notification._id) {
        await api.put(`/notifications/${notification._id}/read`, { read: true });
      }
      toast.success('Approval request dismissed');
      onDismiss?.();
    } catch (err) {
      const msg = err?.response?.data?.message || err?.response?.data?.error || err.message;
      toast.error(msg || 'Failed to dismiss notification');
    }
  };

  return (
    <div data-notif-modal className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 px-6 py-4 text-white">
          <button onClick={onClose} className="absolute right-4 top-4 text-white/70 hover:text-white">
            <X size={20} />
          </button>
          <div className="flex flex-col gap-2">
            <span className="text-xs uppercase tracking-[0.25em] text-white/70">Inventory Approval</span>
            <h2 className="text-xl font-semibold">{unitSnapshot.unitNumber || hierarchy.unitNumber || 'Requested Unit'}</h2>
            {breadcrumb && <p className="text-sm text-white/80">{breadcrumb}</p>}
          </div>
          <div className="mt-4 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
              <CheckCircle2 size={14} />
              {statusLabel}
            </span>
            {/* requestedBy badge removed per UX */}
            {notification.createdAt && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white">
                <ShieldAlert size={14} />
                {formatLocalTimestamp(notification.createdAt)}
              </span>
            )}
          </div>
        </div>

        <div className="grid gap-6 bg-slate-50 px-6 py-6 md:grid-cols-12">
          <section className="md:col-span-12 space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-sm border border-slate-100">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <Building2 className="text-slate-500" size={18} />
                <h3 className="text-base font-semibold text-slate-900">Unit Summary</h3>
              </div>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <InfoRow label="Owner" value={unitSnapshot.ownerName} />
                <InfoRow label="Status" value={statusLabel} />
                <InfoRow label="Email" value={unitSnapshot.email} />
                <InfoRow label="Requested Follow-up" value={requestedBy?.name || meta.followUpReadable} />
              </div>
            </div>
          
          </section>

          {/* Requested By section removed per UX */}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 bg-white px-6 py-4">
          <button
            type="button"
            onClick={handleDismiss}
            className="inline-flex items-center justify-center rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            disabled={submitting}
          >
            Mark as Reviewed
          </button>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={submitting}
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Approving…' : 'Approve & Move to Inventory'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InventoryApprovalModal;
