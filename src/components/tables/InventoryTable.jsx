import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import api from "../../api/api"; // ✅ axios instance
import ConfirmDeleteButton from "../ui/notifications/ConfirmDelete"; // adjust path
import EditOptionsPopup from "../modals/EditInventry"; // adjust path
import TokenSearch from '../ui/TokenSearch';
const InventoryTable = ({ data = [], onDeleteSuccess, hideSearch = false, externalSearch = "", externalRowsPerPage = 10, onPageRowsChange = null }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTokens, setSearchTokens] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [deletingId, setDeletingId] = useState(null);
  const [localData, setLocalData] = useState(data); // ✅ maintain local copy
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [editingRowId, setEditingRowId] = useState(null); // ✅ Track specific row being edited
  // local rows per page (sync with external prop)
  const [rowsPerPage, setRowsPerPage] = useState(externalRowsPerPage);
  
  // Use external search when provided
  const activeSearch = hideSearch ? externalSearch : searchTerm;
  
  // ✅ Popup state management
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedInventory, setSelectedInventory] = useState(null);
  const [inventoryDetails, setInventoryDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  // ✅ Sync localData when parent updates data
  React.useEffect(() => {
    setLocalData(data);
    // Close any open popup when data changes (e.g., after delete/update)
    if (editingRowId && !data.find(row => row._id === editingRowId)) {
      setEditingRowId(null);
    }
  }, [data, editingRowId]);

  // keep rowsPerPage in sync if parent changes externalRowsPerPage
  React.useEffect(() => {
    setRowsPerPage(externalRowsPerPage);
  }, [externalRowsPerPage]);

  // ✅ Search filter supporting tokenized AND search
  const filteredData = useMemo(() => {
    const tokens = (searchTokens && searchTokens.length) ? searchTokens.map(t => String(t).toLowerCase()) : (activeSearch ? [String(activeSearch).toLowerCase()] : []);
    if (!tokens || tokens.length === 0) return localData;
    return localData.filter((row) => {
      const hay = Object.values(row).join(' ').toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }, [localData, activeSearch, searchTokens]);

  // ✅ Sorting
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortConfig.key] ?? "";
      const valB = b[sortConfig.key] ?? "";
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig]);

  // ✅ Pagination
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);
  const startIndex = (currentPage - 1) * rowsPerPage;

  React.useEffect(() => {
    if (typeof onPageRowsChange === 'function') onPageRowsChange(paginatedData);
  }, [paginatedData, onPageRowsChange]);

  // ✅ Sort handler
  const handleSort = (key) => {
    if (key === "action") return;
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  // ✅ Delete handler (optimistic update)
  const handleDelete = async (id) => {
   
    try {
      setDeletingId(id);

      // Optimistically remove row from UI
      setLocalData((prev) => prev.filter((row) => row._id !== id));

      await api.delete(`/inventry/delete/${id}`);

      if (onDeleteSuccess) onDeleteSuccess(id);
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete item. Please try again.");

      // Rollback UI if delete failed
      setLocalData(data);
    } finally {
      setDeletingId(null);
    }
  };

  // ✅ Production-level popup management
  const handleEditClick = (rowId) => {
    // Close any existing popup first, then open the new one
    if (editingRowId === rowId) {
      setEditingRowId(null); // Toggle close if same row
    } else {
      setEditingRowId(rowId); // Open popup for specific row
    }
  };

  const handleEditClose = () => {
    setEditingRowId(null);
  };

  // ✅ Fetch inventory details from API
  const fetchInventoryDetails = async (inventoryId) => {
    try {
      setLoading(true);
      const response = await api.get(`/inventry/inventrylist/${inventoryId}`);
      setInventoryDetails(response.data);
    } catch (error) {
      console.error("Failed to fetch inventory details:", error);
      setInventoryDetails(null);
    } finally {
      setLoading(false);
    }
  };

  // ✅ Handle row click to open popup
  const handleRowClick = (inventory) => {
    setSelectedInventory(inventory);
    setIsPopupOpen(true);
    fetchInventoryDetails(inventory._id);
  };

  return (
    <div className=" rounded-lg">
      {/* ✅ Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        {!hideSearch && (
          <TokenSearch
            value={searchTerm}
            onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
            tokens={searchTokens}
            onTokensChange={(t) => { setSearchTokens(t); setCurrentPage(1); }}
          />
        )}
      </div>
      {/* ✅ Table */}
      <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl ">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10 font-bold">
            <tr>
              <th className="px-4 py-2 font-semibold text-center theading">
                <input
                  type="checkbox"
                  aria-label="Select all inventory"
                  className="w-4 h-4"
                  checked={paginatedData.length > 0 && selectedIds.size === paginatedData.length}
                  onChange={(e) => {
                    e.stopPropagation();
                    const next = new Set(selectedIds);
                    if (e.target.checked) {
                      paginatedData.forEach((r) => next.add(r._id));
                    } else {
                      paginatedData.forEach((r) => next.delete(r._id));
                    }
                    setSelectedIds(next);
                  }}
                />
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("sellerName")}
              >
                Seller Name{" "}
                {sortConfig.key === "sellerName"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("project")}
              >
                Project{" "}
                {sortConfig.key === "project"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("sectorNo")}
              >
                Sector No{" "}
                {sortConfig.key === "sectorNo"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("unitNo")}
              >
                Unit No{" "}
                {sortConfig.key === "unitNo"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("towerNo")}
              >
                Tower No{" "}
                {sortConfig.key === "towerNo"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("typology")}
              >
                Typology{" "}
                {sortConfig.key === "typology"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("size")}
              >
                Size{" "}
                {sortConfig.key === "size"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("demand")}
              >
                Demand{" "}
                {sortConfig.key === "demand"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-2 cursor-pointer hover:bg-gray-200 whitespace-nowrap theading font-semibold"
                onClick={() => handleSort("contactNumbers")}
              >
                Contact No.{" "}
                {sortConfig.key === "contactNumbers"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("paymentStatus")}
              >
                Payment Status{" "}
                {sortConfig.key === "paymentStatus"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("registryType")}
              >
                Registry Type{" "}
                {sortConfig.key === "registryType"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("requirement")}
              >
                Requirement{" "}
                {sortConfig.key === "requirement"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortConfig.key === "date"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("capturedBy")}
              >
                Captured By{" "}
                {sortConfig.key === "capturedBy"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("assignTo")}
              >
                Assign To{" "}
                {sortConfig.key === "assignTo"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("transferTo")}
              >
                Transfer To{" "}
                {sortConfig.key === "transferTo"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("followUpDate")}
              >
                Follow-up Date{" "}
                {sortConfig.key === "followUpDate"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("source")}
              >
                Source{" "}
                {sortConfig.key === "source"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("loanStatus")}
              >
                Loan Status{" "}
                {sortConfig.key === "loanStatus"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold"
                onClick={() => handleSort("remarks")}
              >
                Remarks{" "}
                {sortConfig.key === "remarks"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th className="px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left font-semibold">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row, idx) => (
                <tr
                  key={row._id}
                  className="border-b hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => handleRowClick(row)}
                >
                  <td className="px-4 py-4 text-center">
                    <input
                      type="checkbox"
                      className="w-4 h-4"
                      checked={selectedIds.has(row._id)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const next = new Set(selectedIds);
                        if (e.target.checked) next.add(row._id); else next.delete(row._id);
                        setSelectedIds(next);
                      }}
                      onClick={(e) => e.stopPropagation()}
                    />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.sellerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.Project}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.sector}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.unitNo}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.towerNo}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.typology}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.size}</td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.demand}</td>
                  <td className="px-4 py-4 whitespace-nowrap flex flex-wrap gap-1">
                    {Array.isArray(row.contactNumbers) &&
                      row.contactNumbers.map((num, idx) => (
                        <span
                          key={idx}
                          className=" text-[#020E4F] px-2 rounded-full text-sm"
                        >
                          {num}
                        </span>
                      ))}
                  </td>

                  <td className="px-4 py-4 whitespace-nowrap">{row.email}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.paymentStatus}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.registryType}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.requirement}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.date}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.capturedBy}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.assignTo}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.transferTo}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.followUpDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.source}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.loanStatus}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">{row.remarks}</td>
                  <td className=" px-4 py-2 align-middle  font-medium">
                    <div className="flex gap-2 justify-center items-center">
                      <div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditClick(row._id);
                        }}
                        className="p-1 text-[#00E029] hover:bg-gray-100 rounded transition-colors"
                        title={`Edit ${row.sellerName}`}
                      >
                        <Pencil size={16}/>
                      </button>

                      <EditOptionsPopup
                        isOpen={editingRowId === row._id}
                        onClose={handleEditClose}
                        id={row._id}
                      />
                    </div>
                    <div className="" onClick={(e) => e.stopPropagation()}>
                      <ConfirmDeleteButton
                        onConfirm={() => handleDelete(row._id)}
                        disabled={deletingId === row._id}
                      />
                    </div>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={22} className="text-center py-6 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {/* ✅ Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span>Showing {startIndex + 1} -</span>
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

      {/* ✅ Inventory Details Popup Modal */}
      {isPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {/* ✅ Header */}
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                Property Details - {selectedInventory?.sellerName || 'N/A'}
              </h2>
              <button
                onClick={() => {
                  setIsPopupOpen(false);
                  setSelectedInventory(null);
                  setInventoryDetails(null);
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* ✅ Content */}
            <div className="p-6">
              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading property details...</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* ✅ Basic Property Information */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Property Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Seller Name</span>
                        <p className="text-gray-800">{inventoryDetails?.sellerName || selectedInventory?.sellerName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Project</span>
                        <p className="text-gray-800">{inventoryDetails?.Project || selectedInventory?.Project || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Sector</span>
                        <p className="text-gray-800">{inventoryDetails?.sector || selectedInventory?.sector || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Unit No</span>
                        <p className="text-gray-800">{inventoryDetails?.unitNo || selectedInventory?.unitNo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Tower No</span>
                        <p className="text-gray-800">{inventoryDetails?.towerNo || selectedInventory?.towerNo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Typology</span>
                        <p className="text-gray-800">{inventoryDetails?.typology || selectedInventory?.typology || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Size</span>
                        <p className="text-gray-800">{inventoryDetails?.size || selectedInventory?.size || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Demand</span>
                        <p className="text-gray-800">{inventoryDetails?.demand || selectedInventory?.demand || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Date</span>
                        <p className="text-gray-800">{inventoryDetails?.date || selectedInventory?.date || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Contact Information */}
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Contact Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Contact Numbers</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(inventoryDetails?.contactNumbers || selectedInventory?.contactNumbers || []).map((num, idx) => (
                            <span key={idx} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                              {num}
                            </span>
                          ))}
                          {(!inventoryDetails?.contactNumbers && !selectedInventory?.contactNumbers) && (
                            <p className="text-gray-800">N/A</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Email</span>
                        <p className="text-gray-800">{inventoryDetails?.email || selectedInventory?.email || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Financial Information */}
                  <div className="bg-green-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Financial Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Payment Status</span>
                        <p className="text-gray-800">{inventoryDetails?.paymentStatus || selectedInventory?.paymentStatus || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Registry Type</span>
                        <p className="text-gray-800">{inventoryDetails?.registryType || selectedInventory?.registryType || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Loan Status</span>
                        <p className="text-gray-800">{inventoryDetails?.loanStatus || selectedInventory?.loanStatus || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Assignment & Tracking */}
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Assignment & Tracking</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Captured By</span>
                        <p className="text-gray-800">{inventoryDetails?.capturedBy || selectedInventory?.capturedBy || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Assigned To</span>
                        <p className="text-gray-800">{inventoryDetails?.assignTo || selectedInventory?.assignTo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Transfer To</span>
                        <p className="text-gray-800">{inventoryDetails?.transferTo || selectedInventory?.transferTo || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Follow-up Date</span>
                        <p className="text-gray-800">{inventoryDetails?.followUpDate || selectedInventory?.followUpDate || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Source</span>
                        <p className="text-gray-800">{inventoryDetails?.source || selectedInventory?.source || 'N/A'}</p>
                      </div>
                    </div>
                  </div>

                  {/* ✅ Requirements & Remarks */}
                  <div className="bg-purple-50 rounded-lg p-4">
                    <h3 className="text-lg font-medium mb-3 text-gray-800">Requirements & Remarks</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm font-medium text-gray-600">Requirements</span>
                        <p className="text-gray-800 bg-white p-3 rounded border">
                          {inventoryDetails?.requirement || selectedInventory?.requirement || 'No requirements specified'}
                        </p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-600">Remarks</span>
                        <p className="text-gray-800 bg-white p-3 rounded border">
                          {inventoryDetails?.remarks || selectedInventory?.remarks || 'No remarks available'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTable;
