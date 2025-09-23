import React, { useMemo, useState } from "react";
import { Pencil, Trash2 } from "lucide-react";
import api from "../api/api"; // ✅ axios instance
import ConfirmDeleteButton from "../notifications/ConfirmDelete"; // adjust path

const InventoryTable = ({ data = [], onDeleteSuccess }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: null });
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [deletingId, setDeletingId] = useState(null);
  const [localData, setLocalData] = useState(data); // ✅ maintain local copy

  // ✅ Sync localData when parent updates data
  React.useEffect(() => {
    setLocalData(data);
  }, [data]);

  // ✅ Search filter
  const filteredData = useMemo(() => {
    if (!searchTerm) return localData;
    return localData.filter((row) =>
      Object.values(row)
        .join(" ")
        .toLowerCase()
        .includes(searchTerm.toLowerCase())
    );
  }, [localData, searchTerm]);

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
  const totalPages = Math.ceil(sortedData.length / rowsPerPage);
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage, rowsPerPage]);

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
    if (!window.confirm("Are you sure you want to delete this record?")) return;
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

  return (
    <div className=" rounded-lg">
      {/* ✅ Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <input
          type="text"
          placeholder="Search..."
          className="border px-3 py-2 rounded-full w-full sm:w-64"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
        />
        <select
          value={rowsPerPage}
          onChange={(e) => {
            setRowsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="border px-2 py-1 rounded-md"
        >
          {[5, 10, 20, 50].map((n) => (
            <option key={n} value={n}>
              {n} rows
            </option>
          ))}
        </select>
      </div>

      {/* ✅ Table */}
      <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl ">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" />
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left "
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
                className="min-w-32 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-28 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-40 px-4 py-2 cursor-pointer hover:bg-gray-200 whitespace-nowrap theading"
                onClick={() => handleSort("contactNumbers")}
              >
                Contact Numbers{" "}
                {sortConfig.key === "contactNumbers"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-40 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-28 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-28 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
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
                className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left"
                onClick={() => handleSort("remarks")}
              >
                Remarks{" "}
                {sortConfig.key === "remarks"
                  ? sortConfig.direction === "asc"
                    ? " ▲"
                    : " ▼"
                  : ""}
              </th>
              <th className="min-w-20 px-4 py-6 cursor-pointer select-none whitespace-nowrap theading text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row._id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input type="checkbox" />
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
                          className="bg-gray-200 text-gray-700 px-2 py-1 rounded-full text-sm"
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
                  <td className="flex gap-2 px-4 py-2">
                    <button className="text-blue-600 hover:text-blue-800">
                      <Pencil size={16} />
                    </button>
                    <td className="flex gap-2 px-4 py-2">
                      <ConfirmDeleteButton
                        onConfirm={() => handleDelete(row._id)}
                        disabled={deletingId === row._id}
                      />
                    </td>
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
      <div className="flex justify-between items-center mt-4">
        <p className="text-sm text-gray-600">
          Page {currentPage} of {totalPages || 1}
        </p>
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
            disabled={currentPage === totalPages || totalPages === 0}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default InventoryTable;
