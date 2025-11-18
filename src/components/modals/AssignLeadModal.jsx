import React, { useState, useEffect } from 'react';
import LeadsTable from '../dashboard/ScrollableLeads.jsx';
import { X, User, Search, Trash } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import api from '../../api/api';
import { toast } from 'react-hot-toast';

const AssignLeadModal = ({ isOpen, onClose }) => {
  const [showPreview, setShowPreview] = useState(false);
  // ...existing useState and other hooks...
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedLeadIds, setSelectedLeadIds] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [loading, setLoading] = useState(false);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const queryClient = useQueryClient();


  // Compose table rows: selected leads (not in filteredLeads) + filteredLeads
  // Table should only show filtered leads

  // Fetch leads and users when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchLeads();
      fetchUsers();
    }
  }, [isOpen]);

  const fetchLeads = async () => {
    try {
      setLeadsLoading(true);
  const response = await api.get('/realtleads/getlead');
  // response.data may be array or object with .data
  const allLeads = Array.isArray(response.data) ? response.data : response.data?.data || [];
  setLeads(allLeads);
    } catch (error) {
      console.error('Error fetching leads:', error);
      toast.error('Failed to fetch leads');
    } finally {
      setLeadsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await api.get('/auth/teams');
      setUsers(response.data.users || response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    }
  };

  const handleAssign = async () => {
    if (!selectedLeadIds.length || !selectedUser) {
      toast.error('Please select at least one lead and a user');
      return;
    }
    setShowPreview(true);
  };

  const handleClose = () => {
    setSelectedLeadIds([]);
    setSelectedUser('');
    setSearchTerm('');
    setShowPreview(false);
    onClose();
  };

  // Filter leads based on search term
  // Only show leads whose assignTo is empty (unassigned) and match search
  const filteredLeads = leads.filter(lead => {
    const isUnassigned =
      !lead.assignTo ||
      (typeof lead.assignTo === 'object' ? !lead.assignTo.name || lead.assignTo.name.trim() === '' : lead.assignTo.trim() === '');
    const matchesSearch =
      lead.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.contactNumber?.includes(searchTerm) ||
      lead.email?.toLowerCase().includes(searchTerm.toLowerCase());
    return isUnassigned && matchesSearch;
  });

  // Select-all logic for visible leads (must be after filteredLeads)
  const selectAllRef = React.useRef(null);
  const visibleIds = React.useMemo(() => filteredLeads.map(lead => lead._id), [filteredLeads]);
  const allSelected = visibleIds.length > 0 && visibleIds.every(id => selectedLeadIds.includes(id));
  const someSelected = visibleIds.some(id => selectedLeadIds.includes(id)) && !allSelected;
  React.useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someSelected;
    }
  }, [someSelected, allSelected, filteredLeads, selectedLeadIds]);

  if (!isOpen) return null;
  if (showPreview) {
    // Preview modal for selected leads
    const selectedLeads = leads.filter(lead => selectedLeadIds.includes(lead._id));
    // Import Trash icon from lucide-react
    // ...existing code...
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
  <div className="bg-white rounded-xl p-4 w-full max-w-2xl h-[600px] border border-blue-100 shadow-xl flex flex-col">
          <div className="flex justify-between items-center pb-2 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <button onClick={() => setShowPreview(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Back">
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500" viewBox="0 0 24 24"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
              <h2 className="text-lg font-semibold text-gray-900">Preview Selected Leads</h2>
            </div>
            <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors" title="Close">
              <X size={20} className="text-gray-500" />
            </button>
          </div>
          <div className="bg-gray-50 rounded-xl mt-2 mb-4 border border-gray-200 flex-1 flex flex-col">
            <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2 p-4">
              <span className="inline-block"><User size={18} className="text-blue-500" /></span> Lead Preview
            </div>
            <div className="overflow-x-auto rounded-2xl" style={{ maxHeight: '370px' }}>
              <table className="min-w-full text-xs md:text-sm">
                <thead className="sticky top-0 z-20 bg-gray-100">
                  <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Action</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Employee Name</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Customer Name</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Requirement</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Typology</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Contact Number</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Email</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Status</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Date</th>
                    <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Source</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedLeads.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="text-center py-6 text-gray-400">No leads selected.</td>
                    </tr>
                  ) : (
                    selectedLeads.map(lead => (
                      <tr key={lead._id} className="border-b hover:bg-gray-100 transition" style={{ height: '64px' }}>
                        <td className="px-2 py-4 whitespace-nowrap">
                          <button
                            className="p-2 bg-transparent hover:bg-red-100 rounded-full"
                            onClick={() => setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead._id))}
                            title="Remove Lead"
                          >
                            <Trash size={18} className="text-red-500" />
                          </button>
                        </td>
                        <td className="px-2 py-4 whitespace-nowrap">{selectedUser || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.customerName || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.demand || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.typology || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.contactNumber || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.email || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.status || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.date || '-'}</td>
                        <td className="px-2 py-4 whitespace-nowrap">{lead.source || '-'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <div className="flex justify-center py-2">
            <button
              onClick={async () => {
                if (!selectedLeadIds.length || !selectedUser) {
                  toast.error('Please select at least one lead and a user');
                  return;
                }
                try {
                  setLoading(true);
                  await api.post('/realtleads/bulk-assign', {
                    leadIds: selectedLeadIds,
                    assignTo: selectedUser
                  });
                  toast.success(`Assigned ${selectedLeadIds.length} lead(s) successfully!`);
                  queryClient.invalidateQueries(['leads']);
                  handleClose();
                } catch (error) {
                  console.error('Error bulk assigning leads:', error);
                  toast.error('Failed to assign leads');
                } finally {
                  setLoading(false);
                }
              }}
              className="w-full max-w-md bg-blue-700 text-white rounded-full py-3 text-lg font-semibold shadow-md hover:bg-blue-800 transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main modal (first step)
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-4 w-full max-w-2xl max-h-[95vh] overflow-y-auto border border-blue-100 shadow-xl">
        {/* Modal Header */}
        <div className="flex justify-between items-center pb-2 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Lead assign</h2>
          <button onClick={handleClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Search & Assign Section */}
        <div className="flex flex-col md:flex-row gap-4 py-4">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name Of the Registered Employee</label>
            <div className="relative">
              <select
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none"
                value={selectedUser}
                onChange={e => setSelectedUser(e.target.value)}
              >
                <option value="">Select Employee...</option>
                {users.map(user => (
                  <option key={user._id || user.id || user.name} value={user.name}>
                    {user.name} {user.email ? `(${user.email})` : ''}
                  </option>
                ))}
              </select>
              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 pointer-events-none" />
            </div>
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-700 mb-1">Name of the Lead</label>
            <div className="relative">
              <input
                type="text"
                placeholder="Search Leads..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>
          </div>
          <div className="flex flex-col justify-end gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Preview Table */}
        <div className="bg-gray-50 rounded-xl  mt-2 mb-4 border border-gray-200">
          <div className="font-semibold text-gray-700 mb-2 flex items-center gap-2 p-4">
            <span className="inline-block"><User size={18} className="text-blue-500" /></span> Lead Preview
          </div>
          <div className="overflow-x-auto max-h-64 scrollbar-thin scrollbar-thumb-blue-200 scrollbar-track-blue-50 mx-2">
            <div className="overflow-x-auto max-h-64 rounded-2xl">
              <table className="min-w-full text-xs md:text-sm">
              <thead className="sticky top-0 z-10 bg-gray-100">
                <tr className="bg-gray-100 text-gray-700 border-b border-gray-300">
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">
                    <input
                      ref={selectAllRef}
                      type="checkbox"
                      checked={allSelected}
                      onChange={e => {
                        if (e.target.checked) {
                          // Select all visible leads (add their ids)
                          setSelectedLeadIds(Array.from(new Set([...selectedLeadIds, ...visibleIds])));
                        } else {
                          // Deselect all visible leads (remove their ids)
                          setSelectedLeadIds(selectedLeadIds.filter(id => !visibleIds.includes(id)));
                        }
                      }}
                      className="align-middle"
                    />
                  </th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Employee Name</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Customer Name</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Requirement</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Typology</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Contact Number</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Email</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Status</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Date</th>
                  <th className="px-2 py-4 font-medium text-left whitespace-nowrap">Source</th>
                </tr>
              </thead>
              <tbody>
                {filteredLeads.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-6 text-gray-400">No unassigned leads found.</td>
                  </tr>
                ) : (
                  filteredLeads.map(lead => (
                    <tr key={lead._id} className={`border-b hover:bg-gray-100 transition ${selectedLeadIds.includes(lead._id) ? 'bg-blue-50' : ''}`}>
                      <td className="px-2 py-4 whitespace-nowrap">
                        <input
                          type="checkbox"
                          checked={selectedLeadIds.includes(lead._id)}
                          onChange={e => {
                            if (e.target.checked) {
                              setSelectedLeadIds([...selectedLeadIds, lead._id]);
                            } else {
                              setSelectedLeadIds(selectedLeadIds.filter(id => id !== lead._id));
                            }
                          }}
                          className="align-middle"
                        />
                      </td>
                      <td className="px-2 py-4 whitespace-nowrap">{selectedUser || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.customerName || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.demand || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.typology || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.contactNumber || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.email || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.status || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.date || '-'}</td>
                      <td className="px-2 py-4 whitespace-nowrap">{lead.source || '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
            </div>
          </div>
        </div>

        {/* Preview Button */}
        <div className="flex justify-center py-2">
          <button
            onClick={() => setShowPreview(true)}
            disabled={loading || selectedLeadIds.length === 0 || !selectedUser}
            className="w-full max-w-md bg-blue-700 text-white rounded-full py-3 text-lg font-semibold shadow-md hover:bg-blue-800 transition-colors"
          >
            Preview
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignLeadModal;