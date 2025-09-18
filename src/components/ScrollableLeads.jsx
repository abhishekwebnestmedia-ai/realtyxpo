import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
const LeadsTable = ({ data = [], onEdit, onDelete }) => {
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [localData, setLocalData] = useState(data);
  const navigate = useNavigate();
  
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
    <div className="p-4 bg-white rounded-lg shadow-md">
      {/* 🔍 Search + Rows per page */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded w-full md:w-1/3"
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
      <div className="overflow-x-auto scrollbar-hidden">
        <table className="w-full border-collapse">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" />
              </th>
              {[
                { key: "customerName", label: "Customer Name" },
                { key: "email", label: "Email" },
                { key: "status", label: "Status" },
                { key: "followUpDate", label: "Follow-up Date" },
                { key: "requirement", label: "Requirement" },
                { key: "remark", label: "Remark" },
                { key: "date", label: "Date" },
                { key: "capturedBy", label: "Captured" },
                { key: "assignedTo", label: "Assigned To" },
                { key: "transferTo", label: "Transfer To" },
                { key: "source", label: "Source" },
              ].map(({ key, label }) => (
                <th
                  key={key}
                  className="px-4 py-2 cursor-pointer select-none whitespace-nowrap"
                  onClick={() => handleSort(key)}
                >
                  {label}{" "}
                  {sortConfig.key === key &&
                    (sortConfig.direction === "asc" ? "▲" : "▼")}
                </th>
              ))}
              <th className="px-4 py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, idx) => (
              <tr
                key={idx}
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-2">{row.customerName}</td>
                <td className="px-4 py-2">{row.email}</td>
                <td className="px-4 py-2">{row.status}</td>
                <td className="px-4 py-2">{row.followUp}</td>
                <td className="px-4 py-2">{row.requirement}</td>
                <td className="px-4 py-2">{row.remark}</td>
                <td className="px-4 py-2">{row.date}</td>
                <td className="px-4 py-2">{row.capturedBy}</td>
                <td className="px-4 py-2">{row.assignTo}</td>
                <td className="px-4 py-2">{row.transferTo}</td>
                <td className="px-4 py-2">{row.source}</td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => {
                      onEdit?.(row);
                      // navigate to EditLead page under Add_Delete_Pages and pass the lead in state
                      navigate('/Add_Delete_Pages/EditLead', { state: { lead: row } });
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    <Pencil size={16} />
                  </button>
                  <button
                onClick={() => handleDelete(row)}
                className="text-red-600 hover:text-red-800"
              >
                <Trash2 size={16} />
              </button>
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
    </div>
  );
};

export default LeadsTable;
