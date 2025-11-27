import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { AuthContext } from '../../context/AuthContext';
import api from '../../api/api';
import apiService from '../../api/apiService';
import { toast } from 'react-hot-toast';

const AddBrokerRequirement = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  const [form, setForm] = useState({
    brokerName: '',
    companyName: '',
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
    // Basic validation - only check truly required fields
    if (!form.brokerName?.trim()) {
      setError('Please enter broker name');
      return;
    }
    if (!form.contactNumber?.trim()) {
      setError('Please enter contact number');
      return;
    }
    setLoading(true);
    try {
      // Normalize status capitalization if backend expects specific casing
      const normalizedStatus =
        form.status?.toLowerCase() === 'not connected' ? 'Not Connected' : form.status;

      const payload = { ...form, status: normalizedStatus };
      // Convert datetime-local value to ISO for backend
      if (payload.followUpDate) {
        const d = new Date(payload.followUpDate);
        if (!isNaN(d.getTime())) payload.followUpDate = d.toISOString();
        else delete payload.followUpDate;
      }
      // Try via centralized service first (POST /broker)
      try {
        await apiService.createBrokerRequirement(payload);
      } catch (inner) {
        // Fallback to legacy endpoints if needed
        const endpoint = inner?.response?.status === 404 ? '/broker/create' : '/broker';
        await api.post(endpoint, payload);
      }
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
      toast.success('Broker requirement created successfully!');
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
            <input name="brokerName" value={form.brokerName} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter broker name" />
          </div>
          <div>
            <label className="block mb-1 font-medium">Company Name</label>
            <input name="companyName" value={form.companyName} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter company name (optional)" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Contact No.</label>
            <input
              name="contactNumber"
              value={form.contactNumber}
              onChange={(e) => {
                // Only allow numbers
                const val = e.target.value.replace(/[^0-9]/g, '');
                setForm(prev => ({ ...prev, contactNumber: val }));
              }}
              type="tel"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter contact number"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Status</label>
            <select name="status" value={form.status} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Hot">Hot</option>
              <option value="Not connected">Not connected</option>
              <option value="Serious">Serious</option>
              <option value="Potential">Potential</option>
              <option value="Futuristic">Futuristic</option>
              <option value="Dead Lead">Dead Lead</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">Follow-up Date & Time</label>
            <input
              name="followUpDate"
              value={form.followUpDate}
              onChange={handleChange}
              type="datetime-local"
              className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block mb-1 font-medium">Source</label>
            <input name="source" value={form.source} onChange={handleChange} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter source" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Remark</label>
            <textarea name="remark" value={form.remark} onChange={handleChange} rows={4} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter remark" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Requirement</label>
            <textarea name="requirement" value={form.requirement} onChange={handleChange} rows={4} className="w-full border border-gray-300 bg-[#FAFBFC] rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Enter requirement" />
          </div>
        </div>

        {error && <p className="text-red-500 mt-3">{error}</p>}

        <div className="mt-6 flex gap-3 justify-end">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors">Cancel</button>
          <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">{loading ? 'Saving...' : 'Submit'}</button>
        </div>
      </form>
    </div>
  );
};

export default AddBrokerRequirement;
