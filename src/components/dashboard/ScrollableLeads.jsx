import React, { useState, useMemo, useEffect, useRef } from "react";
import { Pencil, Trash2, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
import { toast } from 'react-hot-toast';
import { formatLocalTimestamp, parseLocalTimestamp } from '../../utils/datetime';
import ConfirmDeleteButton from "../ui/notifications/ConfirmDelete";

// Function to get status styling
const getStatusStyles = (status) => {
  switch (status?.toLowerCase()) {
    case 'hot':
      return {
        backgroundColor: '#FFF5F5',
        color: '#FF3737',
        borderColor: '#FFB5B5'
      };
    case 'not connected':
      return {
        backgroundColor: '#F7F9FA',
        color: '#588EA5',
        borderColor: '#A8C4D3'
      };
    case 'serious':
      return {
        backgroundColor: '#F2FCF7',
        color: '#00BF63',
        borderColor: '#80E5B1'
      };
    case 'futuristic':
      return {
        backgroundColor: '#FFF8FC',
        color: '#FF6CC6',
        borderColor: '#FFB6E3'
      };
    case 'potential':
      return {
        backgroundColor: '#F8F9FF',
        color: '#748DFF',
        borderColor: '#BAC6FF'
      };
    default:
      return {
        backgroundColor: '#F9FAFB',
        color: '#6B7280',
        borderColor: '#D1D5DB'
      };
  }
};
const LeadsTable = ({ data = [], onEdit, onDelete, hideSearch = false, externalSearch = "", externalRowsPerPage = 10, onPageRowsChange = null, externalTokens = [], onExternalTokensChange = undefined }) => {
  const [search, setSearch] = useState("");
  // tokenized search keys (entered words/tokens)
  const [searchTokens, setSearchTokens] = useState([]);
  // helper to add a token safely (dedupe)
  const addToken = (token) => {
    const t = String(token || '').trim();
    if (!t) return;
    setSearchTokens((prev) => {
      if (prev.includes(t)) return prev;
      return [...prev, t];
    });
    setSearch('');
    setCurrentPage(1);
    // keep input focused to avoid scroll/visual jumps when the token chip appears
    if (inputRef.current) {
      // small timeout to let React render the new chip, then refocus
      setTimeout(() => inputRef.current.focus(), 0);
    }
  };
  const inputRef = useRef(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [historyItems, setHistoryItems] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [localData, setLocalData] = useState(data);
  const [selectedIds, setSelectedIds] = useState(new Set());
  // Bulk delete flow: show modal then confirm
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false);
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const bulkDeleteSelected = () => {
    const ids = Array.from(selectedIds).filter(Boolean);
    if (!ids.length) return;
    setShowBulkDeleteModal(true);
  };

  const confirmBulkDelete = async () => {
    const ids = Array.from(selectedIds).filter(Boolean);
    if (!ids.length) {
      setShowBulkDeleteModal(false);
      return;
    }
    setBulkDeleting(true);
    try {
      const resp = await api.post('/realtleads/bulk-delete', { ids });
      setLocalData((prev) => prev.filter((r) => !ids.includes(r._id ?? r.id ?? r.leadId)));
      setSelectedIds(new Set());
      toast.success(resp?.data?.message || `Deleted ${ids.length} lead(s)`);
      ids.forEach(id => onDelete?.({ _id: id }));
    } catch (err) {
      console.error('Bulk delete failed', err);
      toast.error(err?.response?.data?.message || 'Bulk delete failed');
    } finally {
      setBulkDeleting(false);
      setShowBulkDeleteModal(false);
    }
  };
  const navigate = useNavigate();

  // Use external search and rows-per-page when provided. Use local state so we can render an inline select.
  const activeSearch = hideSearch ? externalSearch : search;
  const [rowsPerPage, setRowsPerPage] = useState(externalRowsPerPage);
  useEffect(() => setRowsPerPage(externalRowsPerPage), [externalRowsPerPage]);

  // Function to fetch lead details
  const fetchLeadDetails = async (leadId) => {
    setLoading(true);
    try {
      const response = await api.get(`/realtleads/getlead/${leadId}`);
      // Handle different possible response structures
      let leadData = response.data;
      if (response.data && response.data.lead) {
        leadData = response.data.lead;
      } else if (response.data && response.data.data) {
        leadData = response.data.data;
      }
      setLeadDetails(leadData);
    } catch (error) {
      alert(`Failed to fetch lead details: ${error.response?.data?.message || error.message}`);
      setLeadDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // Helper: split ISO datetime (YYYY-MM-DDTHH:mm:SS+TZ) into date and 12-hour time
  const splitIsoDateTime = (iso) => {
    if (!iso || typeof iso !== 'string') return { date: '', time: '' };
  // match YYYY-MM-DDTHH:MM  (accept 'T' or 't' or a space between date and time)
  // Accept 1 or 2 digit hours (handles inputs like 'T0:00' or 'T9:05')
  const m = iso.match(/^(\d{4}-\d{2}-\d{2})[Tt\s](\d{1,2}):(\d{2})/);
    if (!m) return { date: iso, time: '' };
    const date = m[1];
    const hh = parseInt(m[2], 10);
    const mm = m[3];
    const ampm = hh >= 12 ? 'PM' : 'AM';
    const hour12 = ((hh + 11) % 12) + 1;
    const time = `${String(hour12).padStart(2, '0')}:${mm} ${ampm}`;
    return { date, time };
  };

  // Try to detect if a value is a timestamp and format it to local 12-hour string
  const maybeFormatValue = (v) => {
    try {
      if (v === null || v === undefined || v === '') return '—';
      // If it's already a Date
      if (v instanceof Date) return formatLocalTimestamp(v);
      // If it's an object, stringify a simple one
      if (typeof v === 'object') {
        try { return JSON.stringify(v); } catch { return String(v); }
      }
      // If it's numeric or string, check if it parses as a timestamp
      let parsed = parseLocalTimestamp(v);
      // handle ISO strings with single-digit hour like '2025-11-14T0:00:00+05:30' by padding hour
      if (parsed == null && typeof v === 'string') {
        const padHour = v.replace(/T(\d):/i, (m, h) => `T0${h}:`);
        if (padHour !== v) parsed = parseLocalTimestamp(padHour);
      }
      if (parsed != null) return formatLocalTimestamp(parsed);
      return String(v);
    } catch {
      return String(v);
    }
  };

  // Function to handle row click
  const handleRowClick = (row) => {
    const leadId = row?._id || row?.id || row?.leadId;
    if (leadId) {
      setSelectedLead(row);
      setIsPopupOpen(true);
      fetchLeadDetails(leadId);
    } else {
      alert('Unable to fetch lead details: No valid ID found');
    }
  };

  // Fetch history for a lead
  const fetchHistory = async (leadId) => {
    setLoadingHistory(true);
    try {
      const res = await api.get(`/realtleads/${leadId}/history`);
      // support different shapes
      const payload = res.data?.data || res.data || [];
      setHistoryItems(Array.isArray(payload) ? payload : []);
    } catch {
      setHistoryItems([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Keep localData in sync when parent prop changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // 🔍 Tokenized Filtering (AND semantics)
  const filteredData = useMemo(() => {
    // priority: internal tokens > externalTokens (from parent) > activeSearch
    const tokens = (searchTokens && searchTokens.length) ? searchTokens : ((externalTokens && externalTokens.length) ? externalTokens : (activeSearch ? [activeSearch] : []));
    if (!tokens || tokens.length === 0) return localData || [];
    return (localData || []).filter((row) => {
      // for each token, row must contain it in at least one field
      return tokens.every((t) => {
        const token = String(t || '').toLowerCase().trim();
        if (!token) return true;
        return Object.values(row).some((value) => String(value || '').toLowerCase().includes(token));
      });
    });
  }, [localData, activeSearch, searchTokens, externalTokens]);

  // ↕️ Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = String(a[sortConfig.key] ?? "").toLowerCase();
      const valB = String(b[sortConfig.key] ?? "").toLowerCase();
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // 📄 Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);
  const startIndex = (currentPage - 1) * rowsPerPage;

  // Inform parent about current rendered rows (for export) when paginatedData changes
  React.useEffect(() => {
    if (typeof onPageRowsChange === 'function') {
      onPageRowsChange(paginatedData);
    }
  }, [paginatedData, onPageRowsChange]);

  // propagate internal token changes to parent if they provided a setter
  useEffect(() => {
    if (typeof onExternalTokensChange === 'function') {
      onExternalTokensChange(searchTokens);
    }
  }, [searchTokens, onExternalTokensChange]);

  // 📌 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };
  // 🗑️ Handle delete with API
  const handleDelete = async (row) => {
    // Optimistic remove from UI
    const prev = localData;
    setLocalData((d) => d.filter((r) => r._id !== row._id));

    try {
      await api.delete(`/realtleads/delete/${row._id}`);
      // success: notify parent
      onDelete?.(row);
      alert("Lead deleted successfully ✅");
    } catch {
      // keep variable for message but avoid console noise
      // revert on failure
      setLocalData(prev);
      alert("Failed to delete lead ❌");
    }
  };

  return (
    <div className="  rounded-lg ">
      {/* 🔍 Search + Rows per page */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 ">
        {!hideSearch && (
          <div className="w-full md:w-1/3">
            <div className="flex items-center gap-2">
              <input
                type="text"
                placeholder="Type a keyword and press Enter or +"
                className="border px-3 py-2 rounded-full w-full"
                value={search}
                ref={inputRef}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const token = String(search || '').trim();
                    if (token) {
                      addToken(token);
                    }
                  } else if (e.key === 'Backspace' && !search) {
                    // remove last token when input empty
                    setSearchTokens((prev) => prev.slice(0, Math.max(0, prev.length - 1)));
                  }
                }}
              />

              <button
                type="button"
                onClick={() => {
                  const token = String(search || '').trim();
                  if (token) addToken(token);
                }}
                className="px-3 py-2 bg-blue-600 text-white rounded-full"
                aria-label="Add token"
              >
                +
              </button>
            </div>

            {/* Tokens / chips */}
            {/* reserve vertical space for chips to avoid layout shift when tokens are added */}
            <div className="mt-2">
              {searchTokens && searchTokens.length > 0 && (
                <div className="flex flex-wrap gap-2">
                {searchTokens.map((t, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full text-sm">
                    <span>{t}</span>
                    <button
                      onClick={() => setSearchTokens((prev) => prev.filter((x) => x !== t))}
                      className="text-gray-500 hover:text-gray-700"
                      aria-label={`Remove ${t}`}
                    >
                      ×
                    </button>
                  </div>
                ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bulk Delete Confirmation Modal */}
      {showBulkDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black opacity-40" onClick={() => { if (!bulkDeleting) setShowBulkDeleteModal(false); }} />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-lg p-6 z-10">
            <h3 className="text-lg font-semibold mb-2">Delete {selectedIds.size} lead(s)?</h3>
            <p className="text-sm text-gray-600 mb-4">This action will permanently delete the selected leads. This cannot be undone.</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkDeleteModal(false)}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded border border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700"
              >
                {bulkDeleting ? 'Deleting...' : `Delete ${selectedIds.size}`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk actions toolbar */}
      {selectedIds.size > 0 && (
        <div className="mb-3 flex items-center justify-between bg-white p-2 rounded">
          <div className="text-sm text-gray-700">{selectedIds.size} selected</div>
          <div>
            <button
              onClick={bulkDeleteSelected}
              className="px-3 py-2 bg-red-600 text-white rounded-md text-sm"
            >
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* 📊 Table */}
      <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl ">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 border-b">
            <tr>
              <th className="px-4 py-2 font-medium text-center theading sticky left-0 bg-white z-30">
                <input
                  type="checkbox"
                  aria-label="Select all"
                  className="w-4 h-4"
                  checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                  onChange={(e) => {
                    e.stopPropagation();
                    const next = new Set(selectedIds);
                    if (e.target.checked) {
                      paginatedData.forEach((r) => next.add(r._id ?? r.id ?? r.leadId));
                    } else {
                      paginatedData.forEach((r) => next.delete(r._id ?? r.id ?? r.leadId));
                    }
                    setSelectedIds(next);
                  }}
                />
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading sticky left-12 bg-white z-20"
                onClick={() => handleSort("customerName")}
              >
                Customer Name{" "}
                {sortConfig.key === "customerName" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("contactNumber")}
              >
                Contact Number{" "}
                {sortConfig.key === "contactNumber" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-center font-medium"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortConfig.key === "status" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading font-medium"
                onClick={() => handleSort("followUpDate")}
              >
                Follow-up Date{" "}
                {sortConfig.key === "followUpDate" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("requirement")}
              >
                Requirement{" "}
                {sortConfig.key === "requirement" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("remark")}
              >
                Remark{" "}
                {sortConfig.key === "remark" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("capturedBy")}
              >
                Captured{" "}
                {sortConfig.key === "capturedBy" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("assignedTo")}
              >
                Assigned To{" "}
                {sortConfig.key === "assignedTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("transferTo")}
              >
                Transfer To{" "}
                {sortConfig.key === "transferTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-medium"
                onClick={() => handleSort("source")}
              >
                Source{" "}
                {sortConfig.key === "source" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2 theading font-medium">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row._id ?? row.id ?? idx}
                className="border-b hover:bg-gray-50 transition cursor-pointer"
                onDoubleClick={() => handleRowClick(row)}
              >
                <td className="px-4 py-2 text-center font-medium sticky left-0 bg-white z-20">
                  <input
                    type="checkbox"
                    className="w-4 h-4"
                    checked={selectedIds.has(row._id ?? row.id ?? row.leadId)}
                    onChange={(e) => {
                      e.stopPropagation();
                      const id = row._id ?? row.id ?? row.leadId;
                      const next = new Set(selectedIds);
                      if (e.target.checked) next.add(id); else next.delete(id);
                      setSelectedIds(next);
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </td>
                <td className="px-4 py-4  whitespace-nowrap sticky left-12 bg-white z-10">{row.customerName}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.contactNumber || row.contactNo || 'N/A'}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.email}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span 
                    className="px-6 py-1 rounded-3xl text-sm font-medium border flex items-center justify-center text-center "
                    style={{
                      backgroundColor: getStatusStyles(row.status).backgroundColor,
                      color: getStatusStyles(row.status).color,
                      borderColor: getStatusStyles(row.status).borderColor
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap ">
                  {(() => {
                    const raw = row.followUp || row.followUpDate || '';
                    const { date, time } = splitIsoDateTime(raw);
                    return (
                      <div>
                        <div>{date || 'N/A'}</div>
                        {time && <div className="text-sm text-gray-500">{time}</div>}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.requirement}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.remark}</td>
                <td className="px-4 py-4 whitespace-nowrap ">
                  {(() => {
                    const raw = row.date || row.createdAt || '';
                    const { date, time } = splitIsoDateTime(raw);
                    return (
                      <div>
                        <div>{date || 'N/A'}</div>
                        {time && <div className="text-sm text-gray-500">{time}</div>}
                      </div>
                    );
                  })()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.capturedBy}</td>
                <td className="px-4 py-4 whitespace-nowrap ">
                  {row.assignTo ? `${row.assignTo.name} ` : " "}{" "}
                </td>
                <td className="px-4 py-2 whitespace-nowrap  font-medium">{row.transferTo}</td>
                <td className="px-4 py-2 whitespace-nowrap  font-medium">{row.source}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center align-middle font-medium">
                  <div className="flex items-center justify-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent row click
                        // keep callback for any parent behavior
                        onEdit?.(row);
                        // navigate to the route that App.jsx exposes: /all-leads/:id
                        const id = row?.id ?? row?._id ?? row?.leadId;
                        if (id) {
                          navigate(`/all-leads/${id}`, { state: { lead: row } });
                        } else {
                          // fallback: navigate to list and pass state
                          navigate("/all-leads", { state: { lead: row } });
                        }
                      }}
                      className="text-[#00E029]"
                    >
                      <Pencil size={16} />
                    </button>
                    
                    <div onClick={(e) => e.stopPropagation()}>
                      <ConfirmDeleteButton
                        onConfirm={() => handleDelete(row)}
                        disabled={row.deleting} // optional, if you track deleting state
                        label={<Trash2 size={16} />} // optional: shows your icon inside button
                        className="text-red-600 hover:text-red-800"
                      />
                    </div>
                    {/* History button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        const id = row?.id ?? row?._id ?? row?.leadId;
                        if (!id) return alert('Unable to fetch history: missing id');
                        setSelectedLead(row);
                        setIsHistoryOpen(true);
                        fetchHistory(id);
                      }}
                      title="View history"
                      className="text-[#D4AF37] hover:opacity-80"
                    >
                      <Clock size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span>Showing {startIndex + 1} -</span>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
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
          <span>of {sortedData.length}</span>
        </span>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => p - 1)}
          >
            Prev
          </button>
          <button
            className="px-3 py-1 border rounded disabled:opacity-50"
            disabled={currentPage * rowsPerPage >= sortedData.length}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>

      {/* Lead Details Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                Lead Details - {selectedLead?.customerName}
              </h2>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  setSelectedLead(null);
                  setLeadDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6">
              {loading ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <span className="ml-2 text-gray-600">Loading lead details...</span>
                </div>
              ) : leadDetails ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Name:</span>
                        <p className="text-gray-800">{leadDetails.customerName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-800">{leadDetails.email || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Phone:</span>
                        <p className="text-gray-800">{leadDetails.contactNumber || leadDetails.phone || leadDetails.mobile || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Status:</span>
                        <span 
                          className="inline-block px-3 py-1 rounded-full text-sm font-medium border ml-2"
                          style={{
                            backgroundColor: getStatusStyles(leadDetails.status).backgroundColor,
                            color: getStatusStyles(leadDetails.status).color,
                            borderColor: getStatusStyles(leadDetails.status).borderColor
                          }}
                        >
                          {leadDetails.status || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Contact & Assignment */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Assignment & Tracking</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-gray-600">Captured By:</span>
                        <p className="text-gray-800">{leadDetails.capturedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Assigned To:</span>
                        <p className="text-gray-800">
                          {leadDetails.assignTo?.name || leadDetails.assignedTo || 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Transfer To:</span>
                        <p className="text-gray-800">{leadDetails.transferTo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Source:</span>
                        <p className="text-gray-800">{leadDetails.source || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Requirements & Details */}
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Requirements & Details</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-600">Requirement:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.requirement || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Budget:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.budget || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Location Preference:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.location || leadDetails.preferredLocation || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Property Type:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.propertyType || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Remarks & Follow-up */}
                  <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Remarks & Follow-up</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium text-gray-600">Remarks:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.remark || leadDetails.remarks || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Follow-up:</span>
                        {(() => {
                          const raw = leadDetails.followUp || leadDetails.followUpDate || '';
                          const { date, time } = splitIsoDateTime(raw);
                          return (
                            <div>
                              <p className="text-gray-800 mt-1">{date || 'N/A'}</p>
                              {time && <p className="text-gray-700 text-sm">{time}</p>}
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Created Date:</span>
                        {(() => {
                          const raw = leadDetails.date || leadDetails.createdAt || '';
                          const { date, time } = splitIsoDateTime(raw);
                          return (
                            <div>
                              <p className="text-gray-800 mt-1">{date || 'N/A'}</p>
                              {time && <p className="text-gray-700 text-sm">{time}</p>}
                            </div>
                          );
                        })()}
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Last Updated:</span>
                        {(() => {
                          const raw = leadDetails.updatedAt || '';
                          const { date, time } = splitIsoDateTime(raw);
                          return (
                            <div>
                              <p className="text-gray-800 mt-1">{date || 'N/A'}</p>
                              {time && <p className="text-gray-700 text-sm">{time}</p>}
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>

                  {/* Additional Information */}
                  {leadDetails.additionalInfo && (
                    <div className="bg-gray-50 p-4 rounded-lg md:col-span-2">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
                      <p className="text-gray-800">{leadDetails.additionalInfo}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center text-gray-600 h-32 flex items-center justify-center">
                  Failed to load lead details. Please try again.
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  setSelectedLead(null);
                  setLeadDetails(null);
                }}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
              {selectedLead && (
                <button
                  onClick={() => {
                    onEdit?.(selectedLead);
                    const id = selectedLead?.id ?? selectedLead?._id ?? selectedLead?.leadId;
                    if (id) {
                      navigate(`/all-leads/${id}`, { state: { lead: selectedLead } });
                    }
                    setIsPopupOpen(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
                >
                  Edit Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {isHistoryOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-2xl font-bold text-gray-800">
                Change History - {selectedLead?.customerName || selectedLead?.name || 'Lead'}
              </h2>
              <button
                onClick={() => {
                  setIsHistoryOpen(false);
                  setHistoryItems([]);
                  setSelectedLead(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
              >
                ×
              </button>
            </div>

            <div className="p-6">
              {loadingHistory ? (
                <div className="flex items-center justify-center h-32">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]"></div>
                  <span className="ml-3 text-gray-600">Loading history...</span>
                </div>
              ) : historyItems && historyItems.length > 0 ? (
                <div className="space-y-4">
                  {historyItems.map((h) => (
                    <div key={h._id} className="flex gap-4 items-start">
                      <div className="flex-shrink-0 mt-1">
                        <div className="h-10 w-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-white">
                          <Clock size={16} />
                        </div>
                      </div>
                      <div className="flex-1 bg-gray-50 p-4 rounded-lg">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="text-sm text-gray-600">{h.field}</div>
                            <div className="mt-1 text-gray-800 font-medium">
                              {maybeFormatValue(h.oldValue)} → {maybeFormatValue(h.newValue)}
                            </div>
                          </div>
                          <div className="text-right text-sm text-gray-500">
                            <div>{h.changedBy ? h.changedBy.name : 'System'}</div>
                            <div>{h.changedBy?.email || ''}</div>
                            <div className="mt-1 text-xs">{formatLocalTimestamp(h.changedAt)}</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-gray-600">No history available for this lead.</div>
              )}
            </div>

            <div className="flex justify-end gap-3 p-6 border-t bg-gray-50">
              <button
                onClick={() => {
                  setIsHistoryOpen(false);
                  setHistoryItems([]);
                  setSelectedLead(null);
                }}
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;
