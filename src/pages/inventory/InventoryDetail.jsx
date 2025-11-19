import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api from '../../api/api';
import { formatLocalTimestamp } from '../../utils/datetime';

const InventoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState(null);
  const [error, setError] = useState(null);
  const fallbackMeta = location.state?.notification?.meta;
  const fallbackUnit = fallbackMeta?.unit || null;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const resp = await api.get(`/inventry/inventrylist/${id}`);
        if (!mounted) return;
        setItem(resp.data || null);
        setError(null);
      } catch (err) {
        console.error('Failed to load inventory:', err);
        if (err?.response?.status === 404) {
          setError('Inventory not found yet. If this was just approved, try again after it syncs.');
        } else {
          setError(err?.response?.data?.message || 'Failed to load inventory details');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    if (id) load();
    return () => { mounted = false; };
  }, [id]);

  if (!id) return <div className="p-4">No inventory id provided.</div>;

  if (loading && !fallbackUnit) return <div className="p-6">Loading inventory...</div>;

  const data = item || fallbackUnit;
  if (!data) {
    return (
      <div className="p-6">
        {error ? <p className="text-red-600 mb-2">{error}</p> : null}
        <p>No inventory details available.</p>
      </div>
    );
  }

  const contactNumbers = Array.isArray(data.contactNumbers)
    ? data.contactNumbers
    : Array.isArray(data.mobileNumbers)
      ? data.mobileNumbers
      : data.contactNumbers || data.mobileNumbers
        ? [data.contactNumbers || data.mobileNumbers]
        : [];

  return (
    <div className="p-6">
      <button className="mb-4 btn" onClick={() => navigate(-1)}>Back</button>
      <h2 className="text-2xl font-semibold mb-2">Property Details</h2>
      {error && <div className="mb-4 text-yellow-700 bg-yellow-50 border border-yellow-200 rounded px-4 py-2 text-sm">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Seller</h3>
          <p>{data.sellerName || data.ownerName || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Unit</h3>
          <p>{data.unitNumber || data.unitNo || 'N/A'}</p>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Contact Numbers</h3>
          <div className="flex gap-2 mt-2 flex-wrap">
            {contactNumbers.length ? contactNumbers.map((c) => (
              <span key={c} className="px-2 py-1 bg-slate-100 rounded">{c}</span>
            )) : <span className="text-slate-500">N/A</span>}
          </div>
        </div>
        <div className="bg-white p-4 rounded shadow-sm">
          <h3 className="font-semibold">Follow-up</h3>
          <p>{formatLocalTimestamp(data.followUpDate || data.followUp)}</p>
        </div>
      </div>
    </div>
  );
};

export default InventoryDetail;
