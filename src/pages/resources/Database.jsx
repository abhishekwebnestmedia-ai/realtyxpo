import React, { useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Edit3, Loader2, Notebook, Trash2, Download } from 'lucide-react';
import useIsSuperAdmin from '../../hooks/useIsSuperAdmin';
import toast from 'react-hot-toast';
import api from '../../api/api';
import TokenSearch from '../../components/ui/TokenSearch';
import { exportToExcel, exportToPdf } from '../../utils/exporter';
import ConfirmDeleteButton from '../../components/ui/notifications/ConfirmDelete';

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
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [priceRange, setPriceRange] = useState([1, 40]); // in Crores
  // kept for potential future use (was used for PDF downloads)
  // eslint-disable-next-line no-unused-vars
  const [downloading, setDownloading] = useState(false);
  
  const exportMenuRef = useRef(null);
  const priceFilterRef = useRef(null);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (exportMenuRef.current && !exportMenuRef.current.contains(e.target)) {
        setShowExportMenu(false);
      }
    };
    if (showExportMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showExportMenu]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (priceFilterRef.current && !priceFilterRef.current.contains(e.target)) {
        setShowPriceFilter(false);
      }
    };
    if (showPriceFilter) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showPriceFilter]);

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

  const isSuperAdmin = useIsSuperAdmin();

  const tokens = useMemo(() => {
    if (searchTokens?.length) return searchTokens.map((t) => String(t).toLowerCase());
    return searchTerm ? [searchTerm.toLowerCase()] : [];
  }, [searchTerm, searchTokens]);

  const filteredRecords = useMemo(() => {
    let result = records;
    
    // Apply text search
    if (tokens.length) {
      result = result.filter((record) => {
        const haystack = [
          record.projectName,
          record.divisionName,
          record.typology,
          record.sector,
          record.price,
          record.size,
          record.type,
          record.constructionType,
          record.remarks,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return tokens.every((tok) => haystack.includes(tok));
      });
    }
    
    // Apply price filter
    result = result.filter((record) => {
      if (!record.price) return true;
      const priceStr = String(record.price).toLowerCase();
      const match = priceStr.match(/([0-9.]+)\s*cr/);
      if (match) {
        const value = parseFloat(match[1]);
        return value >= priceRange[0] && value <= priceRange[1];
      }
      return true; // Include if price format doesn't match
    });
    
    return result;
  }, [records, tokens, priceRange]);

  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedRecords = filteredRecords.slice(startIndex, startIndex + rowsPerPage);

  const handleDelete = async (record) => {
    if (!record?._id) return;
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
        <div className="flex items-center gap-2">
          <Link to="/database/add" className="btn inline-flex items-center gap-2">
            Add Entry
          </Link>

  <div className="relative inline-block">
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        setShowExportMenu((prev) => !prev);
      }}
      className="inline-flex items-center gap-2 px-3 py-2 border rounded bg-white hover:bg-gray-50"
    >
      <Download size={16} />
      Export
    </button>

    {showExportMenu && (
      <div
        ref={exportMenuRef}
        className="absolute right-0 mt-2 w-44 bg-white border rounded shadow-lg z-50"
        onClick={(e) => e.stopPropagation()} // <-- IMPORTANT FIX
      >
        {/* Export as XLSX */}
        <button
          type="button"
          className="w-full text-left px-4 py-2 hover:bg-gray-50"
          onClick={async (e) => {
            e.stopPropagation();

            try {
              if (!filteredRecords?.length) {
                toast.error("No data to export");
                setShowExportMenu(false);
                return;
              }

              await exportToExcel(filteredRecords, null, `database-export`);
              toast.success("Excel exported successfully");
            } catch (err) {
              console.error("Export XLSX failed", err);
              toast.error(err?.message || "Export failed");
            } finally {
              setShowExportMenu(false);
            }
          }}
        >
          Export as XLSX
        </button>

        {/* Export as PDF */}
        <button
          type="button"
          className="w-full text-left px-4 py-2 hover:bg-gray-50"
          onClick={async (e) => {
            e.stopPropagation();

            try {
              if (!filteredRecords?.length) {
                toast.error("No data to export");
                setShowExportMenu(false);
                return;
              }

              // Export only specific columns
              const columnsToExport = ['projectName', 'divisionName', 'typology', 'sector', 'price', 'pdfLink', 'constructionType', 'remarks'];
              await exportToPdf(filteredRecords, columnsToExport, `Welcome to Realtyxpo`, "/watermark.png");
              toast.success("PDF exported successfully");
            } catch (err) {
              console.error("Export PDF failed", err);
              toast.error(err?.message || "Export failed");
            } finally {
              setShowExportMenu(false);
            }
          }}
        >
          Export as PDF
        </button>
      </div>
    )}
  </div>


        </div>
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
        <table className="w-full border-collapse text-sm min-h-[300px] ">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 border-b ">
            <tr>
              <th className="px-4 py-6 text-left font-medium theading">Project</th>
              <th className="px-4 py-6 text-left font-medium theading">Location</th>
              <th className="px-4 py-6 text-left font-medium theading">Typology</th>
              <th className="px-4 py-6 text-left font-medium theading">Sector</th>
              <th 
                className="px-4 py-6 cursor-pointer select-none text-left font-medium theading relative"
                onClick={(e) => { e.stopPropagation(); setShowPriceFilter((s) => !s); }}
              >
                Price{(priceRange[0] !== 1 || priceRange[1] !== 40) ? ` (₹${priceRange[0]}-${priceRange[1]} Cr)` : ''}
                {showPriceFilter && (
                  <div 
                    ref={priceFilterRef}
                    className="absolute left-0 top-full mt-2 w-80 bg-white border border-gray-300 rounded-xl shadow-2xl p-5"
                    style={{ zIndex: 9999 }}
                    onClick={(ev) => ev.stopPropagation()}
                  >
                    <div className="mb-4">
                      <div className="text-sm font-semibold text-gray-800 mb-1">Price Range</div>
                      <div className="flex gap-4 items-center">
                        <div className="flex flex-col items-start">
                          <label htmlFor="minPrice" className="text-xs text-gray-600 mb-1">Min (Cr)</label>
                          <input
                            id="minPrice"
                            type="number"
                            min={1}
                            max={priceRange[1]}
                            value={priceRange[0]}
                            onChange={e => {
                              let val = Number(e.target.value);
                              if (val < 1) val = 1;
                              if (val > priceRange[1]) val = priceRange[1];
                              setPriceRange([val, priceRange[1]]);
                            }}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </div>
                        <span className="mx-2 text-gray-500">to</span>
                        <div className="flex flex-col items-start">
                          <label htmlFor="maxPrice" className="text-xs text-gray-600 mb-1">Max (Cr)</label>
                          <input
                            id="maxPrice"
                            type="number"
                            min={priceRange[0]}
                            max={40}
                            value={priceRange[1]}
                            onChange={e => {
                              let val = Number(e.target.value);
                              if (val > 40) val = 40;
                              if (val < priceRange[0]) val = priceRange[0];
                              setPriceRange([priceRange[0], val]);
                            }}
                            className="border rounded px-2 py-1 w-20"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-between gap-2 pt-3 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={() => {
                          setPriceRange([1, 40]);
                          setShowPriceFilter(false);
                        }}
                        className="px-4 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                      >
                        Reset
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowPriceFilter(false)}
                        className="px-4 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                )}
              </th>
              <th className="px-4 py-3 text-left font-medium theading">Size</th>
              <th className="px-4 py-3 text-left font-medium theading">Type</th>
              <th className="px-4 py-3 text-left font-medium theading">Construction</th>
              <th className="px-4 py-3 text-left font-medium theading">Remarks</th>
              <th className="px-4 py-3 text-center font-medium theading">PDF</th>
              <th className="px-4 py-3 text-center font-medium theading">Actions</th>
            </tr>
          </thead>
          <tbody className=''>
            {loading ? (
              <tr>
                <td colSpan={11} className="py-16 text-center whitespace-nowrap">
                  <Loader2 className="mx-auto h-6 w-6 animate-spin text-primary" />
                </td>
              </tr>
            ) : paginatedRecords.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-10 text-center text-gray-500 whitespace-nowrap">
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
                  <td className="px-4 py-4 max-w-xs truncate" title={record.remarks}>{record.remarks || '—'}</td>
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
                      {isSuperAdmin && (
                        <ConfirmDeleteButton
                          onConfirm={() => handleDelete(record)}
                          title="Delete Database Entry"
                          message={`Are you sure you want to delete "${record.projectName}"? This action cannot be undone.`}
                          confirmLabel="Delete"
                          className="inline-flex items-center justify-center rounded p-2 text-red-600 transition hover:bg-red-50"
                          label={<Trash2 className="h-4 w-4" />}
                        />
                      )}
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

      {/* Simple export menu: XLSX and ODS only (no date range) */}
    </div>
  );
};

export default Database;
