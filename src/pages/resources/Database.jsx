import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Loader2, Notebook, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/api';
import TokenSearch from '../../components/ui/TokenSearch';

const useAuthHeaders = () => {
  const [token] = useState(() => (typeof window !== 'undefined' ? localStorage.getItem('token') : null));
  return useMemo(() => (token ? { Authorization: `Bearer ${token}` } : null), [token]);
};

const Database = () => {
  const authHeaders = useAuthHeaders();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [searchTokens, setSearchTokens] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const fetchRecords = useCallback(async () => {
    if (!authHeaders) {
      setError('Authentication token missing. Please sign in again.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const resp = await api.get('/database', { headers: authHeaders });
      const data = resp.data?.data || resp.data || [];
      setRecords(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load database records', err);
      setError(err?.response?.data?.message || err?.message || 'Failed to load records.');
    } finally {
      setLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  const tokens = useMemo(() => {
    if (searchTokens?.length) return searchTokens.map((t) => String(t).toLowerCase());
    return searchTerm ? [searchTerm.toLowerCase()] : [];
  }, [searchTerm, searchTokens]);

  const filteredRecords = useMemo(() => {
    if (!tokens.length) return records;
    return records.filter((record) => {
      const haystack = [
        record.projectName,
        record.divisionName,
        record.typology,
        record.sector,
        record.price,
        record.size,
        record.type,
        record.constructionType,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return tokens.every((tok) => haystack.includes(tok));
    });
  }, [records, tokens]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);

  const handleDelete = async (record) => {
    if (!record?._id) return;
    const confirmed = window.confirm(`Delete "${record.projectName}"?`);
    if (!confirmed) return;
    if (!authHeaders) {
      toast.error('Authentication token missing.');
      return;
    }
    try {
      await api.delete(`/database/${record._id}`, { headers: authHeaders });
      setRecords((prev) => prev.filter((item) => item._id !== record._id));
      toast.success('Database record deleted.');
    } catch (err) {
      console.error('Delete database record failed', err);
      toast.error(err?.response?.data?.message || err?.message || 'Failed to delete record.');
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [rowsPerPage, tokens]);

  return (
    <div className="rounded-lg">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="pageheading mb-0">Database</h1>
        <Link to="/database/add" className="btn inline-flex items-center gap-2">
          Add Entry
        </Link>
      </div>

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <TokenSearch
          value={searchTerm}
          onChange={(value) => {
            setSearchTerm(value);
            setCurrentPage(1);
          }}
          tokens={searchTokens}
          onTokensChange={(value) => {
            setSearchTokens(value);
            setCurrentPage(1);
          }}
          placeholder="Search by project, division, sector or typology"
        />
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

  <div className="overflow-x-auto rounded-xl bg-white">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs">
            <tr>
              <th className="px-4 py-3 text-left font-medium theading">Project</th>
              <th className="px-4 py-3 text-left font-medium theading">Location</th>
              <th className="px-4 py-3 text-left font-medium theading">Typology</th>
              <th className="px-4 py-3 text-left font-medium theading">Sector</th>
              <th className="px-4 py-3 text-left font-medium theading">Price</th>
              <th className="px-4 py-3 text-left font-medium theading">Size</th>
              <th className="px-4 py-3 text-left font-medium theading">Type</th>
              <th className="px-4 py-3 text-left font-medium theading">Construction</th>
              <th className="px-4 py-3 text-center font-medium theading">PDF</th>
              <th className="px-4 py-3 text-center font-medium theading">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={10} className="py-16 text-center whitespace-nowrap">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-10 text-center text-gray-500 whitespace-nowrap">
                  No records found. Try adjusting your search.
                </td>
              </tr>
            ) : (
              paginatedRecords.map((record, index) => (
                <tr key={record._id || index} className="text-sm hover:bg-gray-50">
                  <td className="px-4 py-4 font-medium text-gray-900 whitespace-nowrap">
                    <div>{record.projectName || '—'}</div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.divisionName || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.typology || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.sector || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.price || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.size || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.type || '—'}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{record.constructionType || '—'}</td>
                  <td className="px-4 py-4 text-center whitespace-nowrap">
                    {record.pdfLink ? (
                      <a
                        href={record.pdfLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center justify-center text-primary"
                      >
                        <Notebook className="h-4 w-4" />
                      </a>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center justify-center gap-2">
                      <Link
                        to={`/database/edit/${record._id}`}
                        title="Edit"
                        aria-label={`Edit ${record.projectName || 'record'}`}
                        className="inline-flex items-center justify-center rounded p-2 transition hover:bg-gray-50"
                      >
                        <Edit3 className="h-4 w-4 text-green-600" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(record)}
                        title="Delete"
                        aria-label={`Delete ${record.projectName || 'record'}`}
                        className="inline-flex items-center justify-center rounded p-2 text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span>Showing {filteredRecords.length === 0 ? 0 : startIndex + 1} -</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={8}>8</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={500}>500</option>
            <option value={1000}>1000</option>
          </select>
          <span>of {filteredRecords.length}</span>
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage * rowsPerPage >= filteredRecords.length}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default Database;
