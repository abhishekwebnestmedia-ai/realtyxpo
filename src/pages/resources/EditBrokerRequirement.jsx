import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import TimePicker from '../../components/ui/TimePicker';

const EditBrokerRequirement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    brokerName: '',
    companyName: '',
    contactNumber: '',
    status: 'Hot',
    requirement: '',
    source: '',
    followUpDate: '', // YYYY-MM-DD
    followUpTime: '', // '02:30 PM'
    remark: '',
    capturedBy: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.get(`/broker/${id}`)
      .then(res => {
        const payload = res?.data ?? res;
        const data = payload?.data ?? payload;

        // Parse followUp date/time similar to EditLead
        let followUpDate = '';
        let followUpTime = '';
        const rawFollow = data.followUpDateRaw ?? data.followUpDate ?? '';
        if (rawFollow) {
          const m = String(rawFollow).match(/^([0-9]{4}-[0-9]{2}-[0-9]{2})T([0-9]{2}):([0-9]{2})/);
          if (m) {
            followUpDate = m[1];
            const hh = parseInt(m[2], 10);
            const mm = m[3];
            const ampm = hh >= 12 ? 'PM' : 'AM';
            const hour12 = ((hh + 11) % 12) + 1;
            followUpTime = `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`;
          }
        }

        setForm(prev => ({
          ...prev,
          brokerName: data.brokerName ?? data.name ?? '',
          companyName: data.companyName ?? data.company ?? '',
          contactNumber: data.contactNumber ?? data.contactNo ?? '',
          status: data.status ?? 'Hot',
          requirement: data.requirement ?? '',
          source: data.source ?? '',
          followUpDate,
          followUpTime,
          remark: data.remark ?? '',
          capturedBy: data.capturedBy ?? ''
        }));
      })
      .catch(err => {
        console.error('Fetch broker error', err);
        setError('Failed to load broker');
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      // Combine followUpDate + followUpTime into IST ISO string
      let followUpCombined = '';
      if (form.followUpDate) {
        let hour24 = '00';
        let minute = '00';
        if (form.followUpTime) {
          const parts = form.followUpTime.split(' ');
          const hm = parts[0] || '';
          const ampm = (parts[1] || '').toLowerCase();
          const [hh, mm] = hm.split(':');
          let h = parseInt(hh || '0', 10);
          minute = (mm || '00').padStart(2, '0');
          if (ampm === 'pm' && h !== 12) h += 12;
          if (ampm === 'am' && h === 12) h = 0;
          hour24 = String(h).padStart(2, '0');
        }
        followUpCombined = `${form.followUpDate}T${hour24}:${minute}:00+05:30`;
      }

      const payload = {
        brokerName: form.brokerName,
        companyName: form.companyName,
        contactNumber: form.contactNumber,
        status: form.status,
        requirement: form.requirement,
        source: form.source,
        remark: form.remark,
      };
      if (followUpCombined) payload.followUpDate = followUpCombined;

      await api.put(`/broker/${id}`, payload);
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Broker updated successfully!');
      navigate('/brokers-requirements');
    } catch (err) {
      console.error('Update broker error', err);
      setError(err?.response?.data?.message || 'Failed to update broker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl">
      <h2 className="text-2xl font-medium">Edit Broker Requirement</h2>
      {loading ? (
        <p className="p-4">Loading broker...</p>
      ) : error ? (
        <p className="p-4 text-red-500">{error}</p>
      ) : (
        <form className="mt-5">
          <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block mb-1 font-medium">Broker Name</label>
                <input name="brokerName" value={form.brokerName} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter brokerName" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Company Name</label>
                <input name="companyName" value={form.companyName} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter company name (optional)" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Contact No.</label>
                <input name="contactNumber" value={form.contactNumber} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter contactNumber" />
              </div>
              <div>
                <label className="block mb-1 font-medium">Status</label>
                <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2">
                  <option value="Hot">Hot</option>
                  <option value="Not connected">Not connected</option>
                  <option value="Serious">Serious</option>
                  <option value="Potential">Potential</option>
                  <option value="Futuristic">Futuristic</option>
                  <option value="Dead Lead">Dead Lead</option>
                </select>
              </div>

            <div>
              <label className="block mb-1 font-medium">Follow-up Date</label>
              <input
                name="followUpDate"
                value={form.followUpDate}
                onChange={handleChange}
                type="date"
                className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2 mb-2"
              />
              <TimePicker name="followUpTime" value={form.followUpTime} onChange={handleChange} className="w-full" />
            </div>
              <div>
                <label className="block mb-1 font-medium">Source</label>
                <input name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter source" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Remark</label>
                <textarea name="remark" value={form.remark} onChange={handleChange} rows={4} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
              </div>

                <div>
                  <label className="block mb-1 font-medium">Requirement</label>
                  <textarea name="requirement" value={form.requirement} onChange={handleChange} rows={4} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
                </div>
            </div>

          <div className="mt-6 flex gap-3 justify-end">
            <button type="button" onClick={() => navigate(-1)} className="border border-red-500 text-red-500 bg-white rounded-md px-4 py-2">Cancel</button>
            <button type="button" onClick={handleUpdate} disabled={loading} className="btn px-4 py-2">{loading ? 'Updating...' : 'Update'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBrokerRequirement;
