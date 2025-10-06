import React, { useState, useMemo } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';
import { useBrokers } from '../../hooks/useBrokers';

const BrokersRequirements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Fetch broker data from API
  const { data: brokersData = [], isLoading, error } = useBrokers();

  // Normalize broker data
  const brokers = useMemo(() => {
    if (Array.isArray(brokersData)) return brokersData;
    if (brokersData && Array.isArray(brokersData.data)) return brokersData.data;
    return [];
  }, [brokersData]);

  // Filter data based on search term
  const filteredData = brokers.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  // Loading and error states
  if (isLoading) {
    return (
      <div className="rounded-lg">
        <div className="mb-6">
          <h1 className="pageheading mb-4">Brokers Requirements</h1>
        </div>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500 animate-pulse">Loading brokers data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg">
        <div className="mb-6">
          <h1 className="pageheading mb-4">Brokers Requirements</h1>
        </div>
        <div className="text-center text-red-600 font-medium">
          Failed to load brokers data. Please try again later.
        </div>
      </div>
    );
  }

  // Pagination
  const totalPages = Math.ceil(filteredData.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const paginatedData = filteredData.slice(startIndex, startIndex + rowsPerPage);

  const getStatusColor = (status) => {
    return status === "Hot" ? "text-red-600" : "text-green-600";
  };

  return (
    <div className="rounded-lg">
      <div className="mb-6">
        <h1 className="pageheading mb-4">Brokers Requirements</h1>
      </div>

      {/* Controls */}
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
        <div className="flex items-center gap-4">
          <label className="text-sm font-semibold text-gray-800 whitespace-nowrap">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-200 rounded-lg p-2 text-sm  hover:border-gray-300 focus:outline-none focus:ring-2  min-w-10 cursor-pointer appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 4 5%22><path fill=%22%23666%22 d=%22M2 0L0 2h4zm0 5L0 3h4z%22/></svg>')] bg-no-repeat bg-right bg-[length:12px] "
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2">
                <input type="checkbox" />
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Captured By
              </th>
              <th className="min-w-32 px-4 py-6 whitespace-nowrap theading text-left">
                Broker Name
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Contact
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Status
              </th>
              <th className="min-w-28 px-4 py-6 whitespace-nowrap theading text-left">
                Date
              </th>
              <th className="min-w-40 px-4 py-6 whitespace-nowrap theading text-left">
                Requirement
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Source
              </th>
              <th className="min-w-28 px-4 py-6 whitespace-nowrap theading text-left">
                Follow Up Date
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Remark
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length > 0 ? (
              paginatedData.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50 transition-colors"
                >
                  <td className="px-4 py-4">
                    <input type="checkbox" />
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.capturedBy || row.sellerName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.brokerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.contactNumber}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap font-medium ${getStatusColor(row.status)}`}>
                    {row.status}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : row.date || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.requirement}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.source}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.followUpDate}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.remark}
                  </td>
                  <td className="px-4 py-2 align-middle">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-blue-600"
                        title={`Edit ${row.capturedBy || row.sellerName || 'record'}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
                        title={`Delete ${row.capturedBy || row.sellerName || 'record'}`}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={11} className="text-center py-6 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600">
          Showing {startIndex + 1} to {Math.min(startIndex + rowsPerPage, filteredData.length)} of {filteredData.length} entries
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Previous
          </button>
          <button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="px-3 py-1 border rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default BrokersRequirements;