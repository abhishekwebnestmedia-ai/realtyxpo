import React, { useState, useMemo, useEffect } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import ConfirmDeleteButton from "../notifications/ConfirmDelete";
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
                className="min-w-42 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading"
                onClick={() => handleSort("customerName")}
              >
                Customer Name{" "}
                {sortConfig.key === "customerName" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("email")}
              >
                Email{" "}
                {sortConfig.key === "email" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-32 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("status")}
              >
                Status{" "}
                {sortConfig.key === "status" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-32 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading"
                onClick={() => handleSort("followUpDate")}
              >
                Follow-up Date{" "}
                {sortConfig.key === "followUpDate" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-80 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("requirement")}
              >
                Requirement{" "}
                {sortConfig.key === "requirement" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-80 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("remark")}
              >
                Remark{" "}
                {sortConfig.key === "remark" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-32 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("date")}
              >
                Date{" "}
                {sortConfig.key === "date" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("capturedBy")}
              >
                Captured{" "}
                {sortConfig.key === "capturedBy" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("assignedTo")}
              >
                Assigned To{" "}
                {sortConfig.key === "assignedTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("transferTo")}
              >
                Transfer To{" "}
                {sortConfig.key === "transferTo" &&
                  (sortConfig.direction === "asc" ? "▲" : "▼")}
              </th>
              <th
                className="min-w-32 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="border-b hover:bg-gray-50 transition"
              >
                <td className="px-4 py-2">
                  <input type="checkbox" />
                </td>
                <td className="px-4 py-4">{row.customerName}</td>
                <td className="px-4 py-4">{row.email}</td>
                <td className="px-4 py-4">{row.status}</td>
                <td className="px-4 py-4">{row.followUp}</td>
                <td className="px-4 py-4">{row.requirement}</td>
                <td className="px-4 py-4">{row.remark}</td>
                <td className="px-4 py-4">{row.date}</td>
                <td className="px-4 py-4">{row.capturedBy}</td>
                <td className="px-4 py-4">
                  {row.assignTo ? `${row.assignTo.name} ` : " "}{" "}
                </td>
                <td className="px-4 py-2">{row.transferTo}</td>
                <td className="px-4 py-2">{row.source}</td>
                <td className="px-4 py-2 flex gap-2 items-center justify-between">
                  <button
                    onClick={() => {
                      // keep callback for any parent behavior
                      onEdit?.(row);
                      // navigate to the route that App.jsx exposes: /all-leads/:id
                      const id = row?.id ?? row?._id ?? row?.leadId;
                      // console.log('Edit click, id:', id, 'row:', row);
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
                  
                    <ConfirmDeleteButton
                      onConfirm={() => handleDelete(row)}
                      disabled={row.deleting} // optional, if you track deleting state
                      label={<Trash2 size={16} />} // optional: shows your icon inside button
                      className="text-red-600 hover:text-red-800"
                    />
                  
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
