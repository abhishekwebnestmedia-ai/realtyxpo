import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../../api/api";
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
const LeadsTable = ({ data = [], onEdit, onDelete }) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState(null);
  const [leadDetails, setLeadDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [localData, setLocalData] = useState(data);
  const navigate = useNavigate();

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
      console.error('Error fetching lead details:', error);
      alert(`Failed to fetch lead details: ${error.response?.data?.message || error.message}`);
      setLeadDetails(null);
    } finally {
      setLoading(false);
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

  // Keep localData in sync when parent prop changes
  useEffect(() => {
    setLocalData(data);
  }, [data]);

  // 🔍 Filtering
  const filteredData = useMemo(() => {
    return (localData || []).filter((row) =>
      Object.values(row).some((value) =>
        String(value).toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [localData, search]);

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
    } catch (error) {
      // revert on failure
      console.error("Delete error:", error);
      setLocalData(prev);
      alert("Failed to delete lead ❌");
    }
  };

  return (
    <div className="  rounded-lg ">
      {/* 🔍 Search + Rows per page */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3 ">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded-full w-full md:w-1/3"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          className="border px-3 py-2 rounded"
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} rows
            </option>
          ))}
        </select>
      </div>

      {/* 📊 Table */}
      <div className="overflow-x-auto scrollbar-hidden bg-white rounded-tr-3xl rounded-tl-3xl ">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" />
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading"
                onClick={() => handleSort("customerName")}
              >
                Customer Name{" "}
                {sortConfig.key === "customerName" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortConfig.key === "status" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading"
                onClick={() => handleSort("followUpDate")}
              >
                Follow-up Date{" "}
                {sortConfig.key === "followUpDate" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("requirement")}
              >
                Requirement{" "}
                {sortConfig.key === "requirement" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("remark")}
              >
                Remark{" "}
                {sortConfig.key === "remark" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("capturedBy")}
              >
                Captured{" "}
                {sortConfig.key === "capturedBy" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("assignedTo")}
              >
                Assigned To{" "}
                {sortConfig.key === "assignedTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("transferTo")}
              >
                Transfer To{" "}
                {sortConfig.key === "transferTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("source")}
              >
                Source{" "}
                {sortConfig.key === "source" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th className="px-4 py-2 theading">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={row._id ?? row.id ?? idx}
                className="border-b hover:bg-gray-50 transition cursor-pointer"
                onClick={() => handleRowClick(row)}
              >
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-4  whitespace-nowrap ">{row.customerName}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.email}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span 
                    className="px-10 py-1 rounded-3xl text-sm font-medium border flex  items-center"
                    style={{
                      backgroundColor: getStatusStyles(row.status).backgroundColor,
                      color: getStatusStyles(row.status).color,
                      borderColor: getStatusStyles(row.status).borderColor
                    }}
                  >
                    {row.status}
                  </span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.followUp}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.requirement}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.remark}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.date}</td>
                <td className="px-4 py-4 whitespace-nowrap ">{row.capturedBy}</td>
                <td className="px-4 py-4 whitespace-nowrap ">
                  {row.assignTo ? `${row.assignTo.name} ` : " "}{" "}
                </td>
                <td className="px-4 py-2 whitespace-nowrap ">{row.transferTo}</td>
                <td className="px-4 py-2 whitespace-nowrap ">{row.source}</td>
                <td className="px-4 py-2 whitespace-nowrap text-center align-middle">
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
                      className="text-blue-600 hover:text-blue-800"
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
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 📌 Pagination */}
      <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
        <span>
          Showing {(currentPage - 1) * rowsPerPage + 1} -{" "}
          {Math.min(currentPage * rowsPerPage, sortedData.length)} of{" "}
          {sortedData.length}
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
                        <p className="text-gray-800">{leadDetails.phone || leadDetails.mobile || 'N/A'}</p>
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
                        <span className="font-medium text-gray-600">Follow-up Date:</span>
                        <p className="text-gray-800 mt-1">{leadDetails.followUp || leadDetails.followUpDate || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Created Date:</span>
                        <p className="text-gray-800 mt-1">
                          {leadDetails.date || leadDetails.createdAt ? 
                            new Date(leadDetails.date || leadDetails.createdAt).toLocaleDateString() : 'N/A'
                          }
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-600">Last Updated:</span>
                        <p className="text-gray-800 mt-1">
                          {leadDetails.updatedAt ? 
                            new Date(leadDetails.updatedAt).toLocaleDateString() : 'N/A'
                          }
                        </p>
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
                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition"
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
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                  Edit Lead
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeadsTable;
