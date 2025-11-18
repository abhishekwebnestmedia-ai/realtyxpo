import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const AddDatabaseEntry = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [submitting, setSubmitting] = useState(false);

  const authHeaders = useMemo(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    return token
      ? {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        }
      : null;
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!authHeaders) {
      toast.error('Authentication token missing. Please sign in again.');
      return;
    }

    setSubmitting(true);
    try {
      await api.post('/database', form, { headers: authHeaders });
      toast.success('Database entry created successfully.');
      navigate('/database');
    } catch (err) {
      console.error('Create database entry failed', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to create entry.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6">
      <h1 className="pageheading mb-4">Add Database Entry</h1>
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
            placeholder="DLF Cyber City"
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
            placeholder="DLF Builders"
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
            placeholder="Office Space"
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
            placeholder="Gurgaon Sector 24"
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
            placeholder="₹2 Cr onwards"
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
            placeholder="1500 sq.ft"
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
            placeholder="https://example.com/brochure.pdf"
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
            {submitting ? 'Saving…' : 'Create Entry'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddDatabaseEntry;
