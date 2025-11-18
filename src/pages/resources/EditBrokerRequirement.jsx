import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import showToast from '../../components/ui/notifications/AddSuccess';

const EditBrokerRequirement = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    brokerName: '',
    contactNumber: '',
    status: 'Hot',
    requirement: '',
    source: '',
    followUpDate: '',
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
        setForm(prev => ({
          ...prev,
          brokerName: data.brokerName ?? data.name ?? '',
          contactNumber: data.contactNumber ?? data.contactNo ?? '',
          status: data.status ?? 'Hot',
          requirement: data.requirement ?? '',
          source: data.source ?? '',
          followUpDate: data.followUpDate ?? data.followUp ?? '',
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
      const payload = { ...form };
      // Assumed endpoint for update
      await api.put(`/broker/update/${id}`, payload);
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      showToast({ message: 'Broker updated', type: 'success' });
      navigate('/brokers-requirements');
    } catch (err) {
      console.error('Update broker error', err);
      setError(err?.response?.data?.message || 'Failed to update broker');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
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
              <input name="followUpDate" value={form.followUpDate} onChange={handleChange} type="date" className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter followUpDate" />
            </div>
            <div>
              <label className="block mb-1 font-medium">Remark</label>
              <textarea name="remark" value={form.remark} onChange={handleChange} rows={6} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
            </div>

              <div>
                <label className="block mb-1 font-medium">Requirement</label>
                <textarea name="requirement" value={form.requirement} onChange={handleChange} rows={6} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
              </div>

              <div>
                <label className="block mb-1 font-medium">Remark</label>
                <textarea name="remark" value={form.remark} onChange={handleChange} rows={6} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
              </div>

              <div className="">
                <label className="block mb-1 font-medium">Source</label>
                <input name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter source" />
              </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button type="button" onClick={() => navigate(-1)} className="btn px-4 py-2">Cancel</button>
            <button type="button" onClick={handleUpdate} disabled={loading} className="btn px-4 py-2">{loading ? 'Updating...' : 'Update'}</button>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditBrokerRequirement;
