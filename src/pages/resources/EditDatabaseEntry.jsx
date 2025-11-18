import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/api';

const emptyForm = {
  projectName: '',
  divisionName: '',
  typology: '',
  sector: '',
  price: '',
  size: '',
  pdfLink: '',
  type: '',
  constructionType: '',
};

const keepFormShape = (record = {}) => ({
  projectName: record.projectName || '',
  divisionName: record.divisionName || '',
  typology: record.typology || '',
  sector: record.sector || '',
  price: record.price || '',
  size: record.size || '',
  pdfLink: record.pdfLink || '',
  type: record.type || '',
  constructionType: record.constructionType || '',
});

const EditDatabaseEntry = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token ? { Authorization: `Bearer ${token}` } : null;
  }, []);

  const jsonHeaders = useMemo(() => (authHeaders ? { ...authHeaders, 'Content-Type': 'application/json' } : null), [authHeaders]);

  useEffect(() => {
    const fetchRecord = async () => {
      if (!authHeaders) {
        toast.error('Authentication token missing. Please sign in again.');
        setLoading(false);
        return;
      }
      if (!id) {
        toast.error('Invalid database record.');
        setLoading(false);
        return;
      }

      try {
        const resp = await api.get(`/database/${id}`, { headers: authHeaders });
        const payload = resp.data?.data || resp.data?.record || resp.data;
        setForm(keepFormShape(payload));
      } catch (err) {
        console.error('Fetch database record failed', err);
        // fallback to list search when single record endpoint is unavailable
        try {
          const listResp = await api.get('/database', { headers: authHeaders });
          const listData = listResp.data?.data || listResp.data || [];
          const matched = Array.isArray(listData) ? listData.find((entry) => entry._id === id) : null;
          if (matched) {
            setForm(keepFormShape(matched));
          } else {
            toast.error(err?.response?.data?.message || 'Record not found.');
          }
        } catch (fallbackErr) {
          console.error('Fallback fetch failed', fallbackErr);
          toast.error(err?.response?.data?.message || err?.message || 'Failed to load record.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [authHeaders, id]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!jsonHeaders) {
      toast.error('Authentication token missing.');
      return;
    }
    if (!id) {
      toast.error('Invalid database record.');
      return;
    }

    setSubmitting(true);
    try {
      await api.put(`/database/${id}`, form, { headers: jsonHeaders });
      toast.success('Database entry updated successfully.');
      navigate('/database');
    } catch (err) {
      console.error('Update database record failed', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update record.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="rounded-lg bg-white p-6 text-center text-gray-600">
        Loading database entry...
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-white p-6">
      <h1 className="pageheading mb-4">Edit Database Entry</h1>
      <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="projectName">Project Name</label>
          <input
            id="projectName"
            name="projectName"
            value={form.projectName}
            onChange={handleChange}
            required
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="divisionName">Location</label>
          <input
            id="divisionName"
            name="divisionName"
            value={form.divisionName}
            onChange={handleChange}
            required
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="typology">Typology</label>
          <input
            id="typology"
            name="typology"
            value={form.typology}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="sector">Sector</label>
          <input
            id="sector"
            name="sector"
            value={form.sector}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="price">Price</label>
          <input
            id="price"
            name="price"
            value={form.price}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="size">Size</label>
          <input
            id="size"
            name="size"
            value={form.size}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1 md:col-span-2">
          <label className="font-medium text-sm text-gray-700" htmlFor="pdfLink">PDF Link</label>
          <input
            id="pdfLink"
            name="pdfLink"
            value={form.pdfLink}
            onChange={handleChange}
            type="url"
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="type">Type</label>
          <select
            id="type"
            name="type"
            value={form.type}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          >
            <option value="">Select type</option>
            <option value="Commercial">Commercial</option>
            <option value="Residential">Residential</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="font-medium text-sm text-gray-700" htmlFor="constructionType">Construction Type</label>
          <select
            id="constructionType"
            name="constructionType"
            value={form.constructionType}
            onChange={handleChange}
            className="rounded border border-gray-300 bg-[#FAFBFC] px-3 py-2 text-sm"
          >
            <option value="">Select construction type</option>
            <option value="Ready To Move">Ready To Move</option>
            <option value="Under Construction">Under Construction</option>
          </select>
        </div>

        <div className="mt-4 flex items-center gap-3 md:col-span-2 justify-end">
          <button
            type="button"
            onClick={() => navigate('/database')}
            className="rounded border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn px-4 py-2"
          >
            {submitting ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDatabaseEntry;
