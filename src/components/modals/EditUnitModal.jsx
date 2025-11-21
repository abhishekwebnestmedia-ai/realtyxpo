import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

// Professional, compact Edit Unit modal. Lightweight validation, optimized PATCH.
const EditUnitModal = ({ isOpen, onClose, unit, onSuccess }) => {
  const [form, setForm] = useState({
    unitNumber: '',
    ownerName: '',
    mobileNumbers: [''],
    typology: '',
    size: '',
    email: '',
    status: '',
    remarks: '',
    assignTo: ''
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  const mapBackendStatusToUI = (s) => {
    if (!s) return '';
    const v = String(s).toLowerCase();
    if (/interested/.test(v) || /interested in calling/.test(v) || /interest/.test(v)) return 'For Sale';
    if (v.includes('sale')) return 'For Sale';
    if (v.includes('vacant')) return 'Vacant';
    if (v.includes('rental') || v.includes('rent')) return 'Rental';
    if (v.includes('self') || v.includes('occupied')) return 'Self Occupied';
    // fallback: return original trimmed string if it matches a known UI option casing
    const trimmed = String(s).trim();
    return trimmed;
  };

  useEffect(() => {
    if (!isOpen) return;
    // initialize from provided unit
    const u = unit || {};
    setForm({
      unitNumber: u.unitNumber || u.unitNo || '',
      ownerName: u.ownerName || u.sellerName || '',
      mobileNumbers: (u.mobileNumbers && u.mobileNumbers.length) ? u.mobileNumbers : (u.contactNumbers && u.contactNumbers.length) ? u.contactNumbers : [''],
      typology: Array.isArray(u.typology) ? u.typology.join(', ') : (u.typology || ''),
      size: u.size || '',
      email: u.email || '',
      status: mapBackendStatusToUI(u.status || ''),
      remarks: u.remarks || '',
      // initialize assignTo as empty; we'll map to user _id after fetching users
      assignTo: (typeof u.assignTo === 'string' && /^[0-9a-fA-F]{24}$/.test(u.assignTo)) ? u.assignTo : ''
    });

    // fetch users for assignTo dropdown (lightweight)
    (async () => {
      try {
        const res = await api.get('/auth/alluser');
        const all = res?.data?.users || res?.data || [];
        const list = Array.isArray(all)
          ? all.filter(u => {
              const name = (u?.name || u?.fullName || u?.displayName || '').trim();
              return name !== 'Backup' && name !== 'Backup from everywhere';
            })
          : [];
        setUsers(list);

        // If unit had assignTo set as a name/email, try to resolve to _id from the fetched users
        if (u && u.assignTo && typeof u.assignTo === 'string' && list.length) {
          const matched = list.find(x => (x.name && x.name === u.assignTo) || (x.email && x.email === u.assignTo));
          if (matched && matched._id) {
            setForm(prev => ({ ...prev, assignTo: matched._id }));
          }
        }
      } catch {
        // non-fatal
        setUsers([]);
      }
    })();
  }, [isOpen, unit]);

  if (!isOpen || !unit) return null;

  const resolvedIds = {
    cityId: unit.cityId || unit.meta?.cityId || unit.meta?.city?.id,
    divisionId: unit.divisionId || unit.meta?.divisionId || unit.meta?.division?.id,
    sectorId: unit.sectorId || unit.meta?.sectorId || unit.meta?.sector?.id,
    projectId: unit.projectId || unit.meta?.projectId || unit.meta?.project?.id,
    towerId: unit.towerId || unit.meta?.towerId || unit.meta?.tower?.id,
    unitId: unit.unitId || unit.meta?.unitId || unit._id || unit.id,
    category: unit.category || unit.meta?.category || 'Residential',
    projectcategory: unit.projectcategory || unit.meta?.projectcategory || 'ReadyToMove'
  };

  const handleChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleMobileChange = (idx, value) => {
    const arr = [...form.mobileNumbers];
    arr[idx] = value;
    setForm(prev => ({ ...prev, mobileNumbers: arr }));
  };

  const addMobile = () => setForm(prev => ({ ...prev, mobileNumbers: [...prev.mobileNumbers, ''] }));
  const removeMobile = (idx) => setForm(prev => ({ ...prev, mobileNumbers: prev.mobileNumbers.filter((_, i) => i !== idx) }));

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setLoading(true);
    try {
      const { cityId, divisionId, sectorId, projectId, towerId, unitId, category, projectcategory } = resolvedIds;
      if (!cityId || !divisionId || !sectorId || !projectId || !towerId || !unitId) {
        toast.error('Missing hierarchy identifiers for this unit.');
        setLoading(false);
        return;
      }

      const payload = {};
      // Only send changed fields (optimization)
      if (form.unitNumber !== (unit.unitNumber || unit.unitNo || '')) payload.unitNumber = form.unitNumber;
      if (form.ownerName !== (unit.ownerName || unit.sellerName || '')) payload.ownerName = form.ownerName;
      const mobilesClean = (form.mobileNumbers || []).map(m => (m || '').trim()).filter(Boolean);
      if (JSON.stringify(mobilesClean) !== JSON.stringify(unit.mobileNumbers || unit.contactNumbers || [])) payload.mobileNumbers = mobilesClean;
      if ((form.email || '') !== (unit.email || '')) payload.email = form.email;
      // Map UI selection to backend canonical value.
      // Requirement: remove 'Interested in calling' option from UI and
      // treat selecting 'For Sale' as sending 'Interested in calling' to backend.
      const mappedStatus = (form.status === 'For Sale') ? 'Interested in calling' : (form.status || '');
      const currentUnitStatus = unit.status || '';
      if (mappedStatus && mappedStatus !== currentUnitStatus) payload.status = mappedStatus;
      if ((form.remarks || '') !== (unit.remarks || '')) payload.remarks = form.remarks;
        // typology: store as array on backend, accept comma-separated input here
        const typologyClean = (form.typology || '').split(',').map(s => s.trim()).filter(Boolean);
        const currentTypology = Array.isArray(unit.typology) ? unit.typology : (unit.typology ? [unit.typology] : []);
        if (JSON.stringify(typologyClean) !== JSON.stringify(currentTypology)) payload.typology = typologyClean;
        if ((form.size || '') !== (unit.size || '')) payload.size = form.size;
          // Normalize current assignTo to an id string for reliable comparison
          const currentAssignId = (unit.assignTo && typeof unit.assignTo === 'object') ? (unit.assignTo._id || '') : (typeof unit.assignTo === 'string' ? unit.assignTo : '');
          if ((form.assignTo || '') !== currentAssignId) payload.assignTo = form.assignTo || null;

      if (Object.keys(payload).length === 0) {
        toast('No changes to save');
        setLoading(false);
        return;
      }

      const path = `/projects/project-types/${encodeURIComponent(category)}/${encodeURIComponent(projectcategory)}/cities/${cityId}/divisions/${divisionId}/sectors/${sectorId}/projects/${projectId}/towers/${towerId}/units/${unitId}`;

      await api.patch(path, payload);
      toast.success('Unit updated');
      onSuccess?.();
      onClose?.();
    } catch (err) {
      console.error('Edit unit failed', err);
      toast.error(err?.response?.data?.error || 'Failed to update unit');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl p-4 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Edit Unit</h3>
          <button onClick={onClose} className="text-gray-600 hover:text-gray-800"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Unit Number</label>
              <input value={form.unitNumber} onChange={(e) => handleChange('unitNumber', e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Owner Name</label>
              <input value={form.ownerName} onChange={(e) => handleChange('ownerName', e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Typology (comma separated)</label>
              <input value={form.typology} onChange={(e) => handleChange('typology', e.target.value)} placeholder="e.g. 2BHK, 3BHK" className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Size</label>
              <input value={form.size} onChange={(e) => handleChange('size', e.target.value)} placeholder="e.g. 1200 sqft" className="w-full border rounded-md px-3 py-2" />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Mobile Numbers</label>
            {form.mobileNumbers.map((m, i) => (
              <div key={i} className="flex gap-2 mt-2">
                <input value={m} onChange={(e) => handleMobileChange(i, e.target.value)} className="flex-1 border rounded-md px-3 py-2" />
                {form.mobileNumbers.length > 1 && (
                  <button type="button" onClick={() => removeMobile(i)} className="px-3 py-2 bg-red-500 text-white rounded">Remove</button>
                )}
              </div>
            ))}
            <div className="mt-2">
              <button type="button" onClick={addMobile} className="px-3 py-2 bg-green-600 text-white rounded">Add number</button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-gray-700">Email</label>
              <input value={form.email} onChange={(e) => handleChange('email', e.target.value)} className="w-full border rounded-md px-3 py-2" />
            </div>
            <div>
              <label className="text-sm text-gray-700">Status</label>
              <select value={form.status} onChange={(e) => handleChange('status', e.target.value)} className="w-full border rounded-md px-3 py-2">
                <option value="">-- Select --</option>
                <option>Vacant</option>
                <option>Rental</option>
                <option>Self Occupied</option>
                <option>For Sale</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-700">Assign To</label>
            <select value={form.assignTo} onChange={(e) => handleChange('assignTo', e.target.value)} className="w-full border rounded-md px-3 py-2">
              <option value="">-- Unassigned --</option>
              {users.map(u => (
                  <option key={u._id} value={u._id}>{u.name || u.email}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-700">Remarks</label>
            <textarea value={form.remarks} onChange={(e) => handleChange('remarks', e.target.value)} className="w-full border rounded-md px-3 py-2" rows={3} />
          </div>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-gray-200 rounded">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUnitModal;
