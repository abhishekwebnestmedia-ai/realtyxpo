import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import apiService from '../../api/apiService';
import showToast from '../../components/ui/notifications/AddSuccess';

const AddBrokerRequirement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    brokerName: '',
    contactNumber: '',
    status: 'Hot',
    requirement: '',
    source: '',
    followUpDate: '',
    remark: '',
    capturedBy: user?.name || ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    // Client-side validation: required fields
    if (!form.brokerName || !form.contactNumber || !form.requirement || !form.followUpDate) {
      setError('Please fill Broker Name, Contact Number, Requirement and Follow-up Date');
      return;
    }
    setLoading(true);
    try {
      // Normalize status capitalization if backend expects specific casing
      const normalizedStatus =
        form.status?.toLowerCase() === 'not connected' ? 'Not Connected' : form.status;

      const payload = { ...form, status: normalizedStatus };
      // Try via centralized service first (POST /broker)
      try {
        await apiService.createBrokerRequirement(payload);
      } catch (inner) {
        // Fallback to legacy endpoints if needed
        const endpoint = inner?.response?.status === 404 ? '/broker/create' : '/broker';
        await api.post(endpoint, payload);
      }
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      showToast({ message: 'Broker requirement added', type: 'success' });
      navigate('/brokers-requirements');
    } catch (err) {
      console.error('AddBrokerRequirement error', err);
      setError(err?.response?.data?.message || 'Failed to add broker requirement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded-2xl">
      <h2 className="text-2xl font-medium">Add Broker Requirement</h2>
      <form onSubmit={handleSubmit} className="mt-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block mb-1 font-medium">Broker Name</label>
            <input name="brokerName" value={form.brokerName} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter brokerName" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Contact No.</label>
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={handleChange}
              pattern="^[0-9]{7,15}$"
              title="Enter a valid phone number (digits only)"
              required
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2"
              placeholder="Enter contactNumber"
            />
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
            <input name="followUpDate" value={form.followUpDate} onChange={handleChange} type="date" required className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Remark</label>
            <textarea name="remark" value={form.remark} onChange={handleChange} rows={6} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter remark" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Requirement</label>
            <textarea name="requirement" value={form.requirement} onChange={handleChange} rows={6} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter requirement" />
          </div>

          <div className="">
            <label className="block mb-1 font-medium">Source</label>
            <input name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded px-3 py-2" placeholder="Enter source" />
          </div>
        </div>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="rounded border border-red-500 px-4 py-2 text-red-600 hover:bg-red-50">Cancel</button>
          <button type="submit" disabled={loading} className="btn px-4 py-2">{loading ? 'Saving...' : 'Save'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddBrokerRequirement;
