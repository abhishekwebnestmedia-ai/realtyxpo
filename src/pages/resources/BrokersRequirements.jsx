import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { toast } from 'react-hot-toast';
import ConfirmDeleteButton from '../../components/ui/notifications/ConfirmDelete';
import TokenSearch from '../../components/ui/TokenSearch';
import { Pencil } from 'lucide-react';
import useIsSuperAdmin from '../../hooks/useIsSuperAdmin';
import { Link } from 'react-router-dom';
import AddBulkBrokerRequirements from '../../components/modals/AddBulkBrokerRequirements';
import Pagination from '../../components/ui/Pagination';
import { useBrokers } from '../../hooks/useBrokers';
const BrokersRequirements = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTokens, setSearchTokens] = useState([]);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  // Fetch broker data from API
  const { data: brokersData = [], isLoading, error } = useBrokers();

  // Normalize broker data
  const brokers = useMemo(() => {
    if (Array.isArray(brokersData)) return brokersData;
    if (brokersData && Array.isArray(brokersData.data)) return brokersData.data;
    return [];
  }, [brokersData]);

  // Filter data based on tokenized search (AND semantics)
  const filteredData = useMemo(() => {
    const tokens = (searchTokens && searchTokens.length) ? searchTokens.map(t => String(t).toLowerCase()) : (searchTerm ? [searchTerm.toLowerCase()] : []);
    if (!tokens || tokens.length === 0) return brokers;
    return brokers.filter(row => {
      const hay = Object.values(row).join(' ').toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }, [brokers, searchTerm, searchTokens]);

  // Ensure hooks are called in the same order every render by calling
  // `useIsSuperAdmin` before any early returns below.
  const isSuperAdmin = useIsSuperAdmin();

  // Routing & query helpers (must be called unconditionally)
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleEdit = (id) => {
    if (!id) return;
    navigate(`/brokers-requirements/edit/${id}`);
  };

  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/broker/${id}`);
      toast.success('Broker requirement deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['brokers'] });
    } catch (err) {
      console.error('Delete broker error', err);
      toast.error(err?.response?.data?.message || 'Failed to delete broker');
    }
  };

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
      <div className="mb-6 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="pageheading mb-0">Brokers Requirements</h1>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBulkModalOpen(true)}
            className="btn"
          >
            Add Bulk Broker Requirements
          </button>
          <Link to="/brokers-requirements/add" className="btn">
            Add Broker Requirement
          </Link>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2 mb-4">
        <TokenSearch
          value={searchTerm}
          onChange={(v) => { setSearchTerm(v); setCurrentPage(1); }}
          tokens={searchTokens}
          onTokensChange={(t) => { setSearchTokens(t); setCurrentPage(1); }}
        />
        {/* rows-per-page removed; pagination renders inline select */}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-tr-3xl rounded-tl-3xl">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-100 text-gray-600 uppercase text-xs sticky top-0 z-10">
            <tr>
              <th className="px-4 py-2 font-medium theading">S.No</th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Captured By
              </th>
              <th className="min-w-32 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Broker Name
              </th>
              <th className="min-w-32 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Company
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Contact
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Status
              </th>
              <th className="min-w-28 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Date
              </th>
              <th className="min-w-40 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Requirement
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Source
              </th>
              <th className="min-w-28 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Follow Up Date
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
                Remark
              </th>
              <th className="min-w-20 px-4 py-6 whitespace-nowrap theading text-left font-medium">
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
                  <td className="px-4 py-4 text-center">{startIndex + paginatedData.indexOf(row) + 1}</td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.capturedBy || row.sellerName || 'N/A'}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                      {row.brokerName}
                    </td>
                    <td className="px-4 py-4 whitespace-nowrap">
                      {row.companyName || row.company || '—'}
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
                    {row.followUpDate ? (
                      row.followUpDate
                    ) : row.followUpDateRaw ? (
                      new Date(row.followUpDateRaw).toLocaleString('en-IN', { hour12: true, day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' })
                    ) : (
                      '—'
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    {row.remark}
                  </td>
                  <td className="px-4 py-2 align-middle font-medium">
                    <div className="flex gap-2 justify-center items-center">
                      <button
                        onClick={() => handleEdit(row._id || row.id)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors text-blue-600"
                        title={`Edit ${row.capturedBy || row.sellerName || 'record'}`}
                      >
                        <Pencil size={16} />
                      </button>
                      {isSuperAdmin && (
                        <ConfirmDeleteButton onConfirm={() => handleDelete(row._id || row.id)} />
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={12} className="text-center py-6 text-gray-500">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <div className="text-sm text-gray-600 flex items-center gap-2">
          <span>Showing {startIndex + 1} -</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border rounded px-2 py-1 text-sm"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </select>
          <span>of {filteredData.length} entries</span>
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
      {isBulkModalOpen && (
        <AddBulkBrokerRequirements
          isOpen={isBulkModalOpen}
          onClose={() => setIsBulkModalOpen(false)}
        />
      )}
    </div>
  );
};

export default BrokersRequirements;