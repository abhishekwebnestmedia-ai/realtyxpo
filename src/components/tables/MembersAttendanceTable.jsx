import React, { useState, useMemo } from "react";
import { ChevronDown, Filter, CheckCircle2, XCircle, ArrowUpRight, Loader2, Search, Download, Users, X } from "lucide-react";
import { useActiveUsers } from "../../hooks/useActiveUsers";

const MembersAttendanceTable = ({ isDashboard = true, onClose = null }) => {
  const { data: activeUsersData, isLoading, isError, error } = useActiveUsers();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Transform API data to match component structure
  const members = useMemo(() => {
    return activeUsersData?.users?.map(user => ({
      id: user._id,
      status: user.isLoggedIn ? "present" : "absent",
      name: user.name,
      email: user.email,
      phone: user.phone || "N/A",
      department: user.department || "General",
      loginTime: user.lastLoginTime || "N/A"
    })) || [];
  }, [activeUsersData]);

  // Filter and search logic (only for full view)
  const filteredMembers = useMemo(() => {
    if (isDashboard) return members;
    
    return members.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           member.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || member.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [members, searchTerm, statusFilter, isDashboard]);

  // Pagination (only for full view)
  const totalPages = Math.ceil(filteredMembers.length / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const displayMembers = isDashboard 
    ? members // Dashboard shows all members with internal scrolling
    : filteredMembers.slice(startIndex, startIndex + rowsPerPage);

  const statusIcons = {
    present: <CheckCircle2 className="w-5 h-5 text-green-500" />,
    absent: <XCircle className="w-5 h-5 text-red-500" />,
  };

  // Stats for full view
  const statusCounts = useMemo(() => {
    return {
      total: members.length,
      present: members.filter(m => m.status === 'present').length,
      absent: members.filter(m => m.status === 'absent').length
    };
  }, [members]);

  const handleViewAll = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (onClose) onClose();
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={`flex flex-col rounded-2xl w-full bg-[#F4F6FF] shadow-sm ${!isDashboard ? 'h-full' : ''}`}>
        <div className="flex justify-between items-center px-5 py-3">
          <h2 className="font-semibold text-gray-800">
            {isDashboard ? "Members Attendance" : "Members Attendance - Full View"}
          </h2>
          <div className="flex gap-3 text-sm text-gray-600">
            {!isDashboard && onClose && (
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
            {isDashboard && (
              <>
                {/* <button 
                  onClick={handleViewAll}
                  className="flex items-center gap-1 hover:text-cyan-600 transition"
                >
                  View All <ArrowUpRight size={16} />
                </button> */}
                
              </>
            )}
          </div>
        </div>
        <div className="bg-white mx-[6px] rounded-2xl mb-1 flex items-center justify-center py-12">
          <div className="flex items-center gap-2 text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading attendance data...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className={`flex flex-col rounded-2xl w-full bg-[#F4F6FF] shadow-sm ${!isDashboard ? 'h-full' : ''}`}>
        <div className="flex justify-between items-center px-5 py-3">
          <h2 className="font-semibold text-gray-800">
            {isDashboard ? "Members Attendance" : "Members Attendance - Full View"}
          </h2>
          <div className="flex gap-3 text-sm text-gray-600">
            {!isDashboard && onClose && (
              <button 
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X size={20} className="text-gray-500" />
              </button>
            )}
            {isDashboard && (
              <>
                {/* <button 
                  onClick={handleViewAll}
                  className="flex items-center gap-1 hover:text-cyan-600 transition"
                >
                  View All <ArrowUpRight size={16} />
                </button>
                <button className="flex items-center gap-1 hover:text-cyan-600 transition">
                  Filter <Filter size={16} />
                </button> */}
              </>
            )}
          </div>
        </div>
        <div className="bg-white mx-[6px] rounded-2xl mb-1 flex items-center justify-center py-12">
          <div className="text-center text-red-500">
            <XCircle className="w-8 h-8 mx-auto mb-2" />
            <p className="font-medium">Failed to load attendance data</p>
            <p className="text-sm text-gray-500 mt-1">
              {error?.response?.data?.message || "Please try again later"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`flex flex-col rounded-2xl w-full bg-[#F4F6FF] shadow-sm ${!isDashboard ? 'h-full' : ''}`}>
        {/* Stats Cards - Only in full view */}
        {!isDashboard && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-blue-600 font-medium">Total Members</p>
                    <p className="text-2xl font-bold text-blue-800">{statusCounts.total}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="text-sm text-green-600 font-medium">Present Today</p>
                    <p className="text-2xl font-bold text-green-800">{statusCounts.present}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                <div className="flex items-center gap-3">
                  <XCircle className="w-8 h-8 text-red-600" />
                  <div>
                    <p className="text-sm text-red-600 font-medium">Absent Today</p>
                    <p className="text-2xl font-bold text-red-800">{statusCounts.absent}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="flex justify-between items-center px-5 py-3">
          <h2 className="font-semibold text-gray-800">
            {isDashboard ? "Members Attendance" : "Members Attendance - Full View"}
            {!isDashboard && ` (${filteredMembers.length})`}
          </h2>
          <div className="flex gap-3 text-sm text-gray-600">
            {!isDashboard ? (
              <>
               
                {onClose && (
                  <button 
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-500" />
                  </button>
                )}
              </>
            ) : (
              <>
                {/* <button 
                  onClick={handleViewAll}
                  className="flex items-center gap-1 hover:text-cyan-600 transition"
                >
                  View All <ArrowUpRight size={16} />
                </button> */}
                
              </>
            )}
          </div>
        </div>

        {/* Search and Controls - Only in full view */}
        {!isDashboard && (
          <div className="px-5 pb-3">
            <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search members..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-64"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                >
                  <option value="all">All Status</option>
                  <option value="present">Present Only</option>
                  <option value="absent">Absent Only</option>
                </select>
              </div>

              <div className="flex items-center gap-4">
                {/* rows-per-page removed from header; will render inline select in pagination */}
              </div>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="bg-white mx-[6px] rounded-2xl mb-1">
          <div className={`overflow-x-auto scrollbar-hidden ${isDashboard ? 'h-64 overflow-y-auto' : ''}`}>
            <table className="w-full text-sm text-left text-gray-700">
              <thead className={`text-gray-600 bg-[#FAFBFC] uppercase text-xs ${isDashboard ? 'sticky top-0 z-20' : ''}`}>
                <tr className="first:rounded-t-2xl">
                  <th className="px-4 py-3 w-16 first:rounded-tl-2xl font-medium">Status</th>
                  <th className="px-4 py-3 whitespace-nowrap font-medium">Name</th>
                  <th className={`px-4 py-3 min-w-[200px] font-medium ${isDashboard ? 'rounded-tr-2xl' : ''}`}>Email</th>
                  {!isDashboard && <th className="px-4 py-3 min-w-[140px] font-medium">Phone No.</th>}
                  {!isDashboard && <th className="px-4 py-3 min-w-[120px] font-medium">Department</th>}
                  {!isDashboard && <th className="px-4 py-3 min-w-[140px] rounded-tr-2xl font-medium">Last Login</th>}
                </tr>
              </thead>
              <tbody>
                {displayMembers.length > 0 ? (
                  displayMembers.map((member, i) => (
                    <tr
                      key={member.id || i}
                      className={`hover:bg-gray-100 transition ${isDashboard ? '' : 'border-t border-gray-200'}`}
                    >
                      <td className="px-4 py-3 self-center font-medium">{statusIcons[member.status]}</td>
                      <td className="px-4 py-3 whitespace-nowrap font-medium">{member.name}</td>
                      <td
                        className="px-4 py-3 truncate  text-gray-600 font-medium"
                        title={member.email}
                      >
                        {member.email}
                      </td>
                      {!isDashboard && (
                        <>
                          <td className="px-4 py-3 text-gray-600 font-medium">{member.phone}</td>
                          <td className="px-4 py-3 text-gray-600 font-medium">{member.department}</td>
                          <td className="px-4 py-3 text-gray-600 font-medium">{member.loginTime}</td>
                        </>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={isDashboard ? 3 : 6} className="px-6 py-12 text-center text-gray-500">
                      <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p className="text-lg font-medium mb-1">No members found</p>
                      <p className="text-sm">Try adjusting your search or filter criteria</p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        
          {!isDashboard && totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-600 flex items-center gap-2">
                    <span>Showing {startIndex + 1}-</span>
                    <select
                      value={rowsPerPage}
                      onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
                      className="border rounded px-2 py-1 text-sm"
                    >
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                      <option value={50}>50</option>
                      <option value={100}>100</option>
                    </select>
                    <span>of {filteredMembers.length} members</span>
                  </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Previous
                </button>
                <span className="px-3 py-1 text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border rounded disabled:opacity-50 hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

     
        {isDashboard && (
          <div className="px-5 py-2 text-xs text-gray-500  border-gray-200">
            <div className="flex justify-between items-center">
              <span>
                Present: {members.filter(m => m.status === 'present').length} | 
                Absent: {members.filter(m => m.status === 'absent').length}
              </span>
              <span>Total: {members.length} members</span>
            </div>
          </div>
        )}
      </div>

   
      {/* {isModalOpen && !isDashboard && (
        <div className="fixed inset-0 z-50 overflow-hidden">
    
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />
          
       
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
              <MembersAttendanceTable 
                isDashboard={false} 
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )} */}

   
      {/* {isModalOpen && isDashboard && (
        <div className="fixed inset-0 z-50 overflow-hidden">
         
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={handleCloseModal}
          />
          
       
          <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-7xl h-[95vh] overflow-hidden">
              <MembersAttendanceTable 
                isDashboard={false} 
                onClose={handleCloseModal}
              />
            </div>
          </div>
        </div>
      )} */}
    </>
  );
};

export default MembersAttendanceTable;
