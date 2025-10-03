import React, { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import Pagination from '../../components/ui/Pagination';

const BrokersRequirements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  // Static data matching the table from the image
  const staticData = [
    {
      id: 1,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 2,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Normal",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 3,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Normal",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 4,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 5,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 6,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 7,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    },
    {
      id: 8,
      sellerName: "Abhishek Singh",
      brokerName: "Abhishek Singh",
      contact: "+91 8171 869 937",
      status: "Hot",
      date: "31 July 25",
      requirement: "To Givrd Acrh",
      source: "WhatsApp",
      followUpDate: "31 July 25",
      remark: "Lorem is..."
    }
  ];

  // Filter data based on search term
  const filteredData = staticData.filter((row) =>
    Object.values(row)
      .join(" ")
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

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
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Rows per page:</label>
          <select
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="border border-gray-300 rounded px-2 py-1 text-sm"
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
                Seller Name
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
                    {row.sellerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.brokerName}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.contact}
                  </td>
                  <td className={`px-4 py-4 whitespace-nowrap font-medium ${getStatusColor(row.status)}`}>
                    {row.status}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.date}
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
                        title={`Edit ${row.sellerName}`}
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-red-600"
                        title={`Delete ${row.sellerName}`}
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