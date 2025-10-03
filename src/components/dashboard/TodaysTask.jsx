import React, { useState, useMemo } from "react";
import { CheckSquare, Filter, Download, ExternalLink, PlusCircle, Search, NotebookPen } from "lucide-react";
import { useDailyTasks } from "../../hooks/useDailyTasks";

const TodaysTask = ({ isDashboard = false }) => {
  const { data: dailyTasksData = [], isLoading, isError } = useDailyTasks();
  const [currentPage, setCurrentPage] = useState(1);
  const [search, setSearch] = useState("");
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });
  const [rowsPerPage, setRowsPerPage] = useState(4);
  
  // Notes popup state
  const [isNotesPopupOpen, setIsNotesPopupOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");

  // Handle notes popup
  const handleNotesClick = (notes) => {
    setSelectedNotes(notes || "No notes available");
    setIsNotesPopupOpen(true);
  };

  // Transform API data to match the expected format
  const transformedData = dailyTasksData.map(task => ({
    name: task.name,
    morning: {
      commitment: "Morning Commitment",
      portal: task.morningCommitment?.onlinePortalChecked || 0,
      whatsapp: task.morningCommitment?.whatsappStatus || 0,
      buyers: task.morningCommitment?.buyersWorking || "-",
      sellers: task.morningCommitment?.sellersWorking || "-",
      met: task.meetingVisits || 0,
      email: task.morningCommitment?.emailWorking || 0
    },
    evening: {
      commitment: "Evening Achievements",
      portal: task.eveningAchievements?.onlinePortalChecked || 0,
      whatsapp: task.eveningAchievements?.whatsappStatus || 0,
      buyers: task.eveningAchievements?.buyersWorking || "-",
      sellers: task.eveningAchievements?.sellersWorking || "-",
      met: task.meetingVisits || 0,
      email: task.eveningAchievements?.emailWorking || 0
    },
    date: task.date,
    notes: task.addNotes,
    id: task._id || task.id
  }));

  const data = useMemo(() => {
    return transformedData.length > 0 ? transformedData : [];
  }, [transformedData]);

  // 🔍 Filtering
  const filteredData = useMemo(() => {
    if (isDashboard) return data; // Skip filtering for dashboard
    
    return data.filter((task) => {
      const searchableValues = [
        task.name,
        task.date,
        task.notes || "",
        String(task.morning.portal),
        String(task.morning.whatsapp),
        String(task.morning.email),
        String(task.evening.portal),
        String(task.evening.whatsapp),
        String(task.evening.email)
      ];
      
      return searchableValues.some(value => 
        String(value).toLowerCase().includes(search.toLowerCase())
      );
    });
  }, [data, search, isDashboard]);

  // ✅ Sorting
  const sortedData = useMemo(() => {
    if (isDashboard || !sortConfig.key) return filteredData;
    
    return [...filteredData].sort((a, b) => {
      let valA, valB;
      
      // Handle nested properties like 'morning.portal'
      if (sortConfig.key.includes('.')) {
        const [section, field] = sortConfig.key.split('.');
        valA = String(a[section]?.[field] ?? "").toLowerCase();
        valB = String(b[section]?.[field] ?? "").toLowerCase();
      } else {
        valA = String(a[sortConfig.key] ?? "").toLowerCase();
        valB = String(b[sortConfig.key] ?? "").toLowerCase();
      }
      
      if (valA < valB) return sortConfig.direction === "asc" ? -1 : 1;
      if (valA > valB) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });
  }, [filteredData, sortConfig, isDashboard]);

  // 📄 Pagination
  const displayData = isDashboard ? sortedData.slice(0, 4) : sortedData;
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = isDashboard 
    ? displayData
    : displayData.slice(indexOfFirstRow, indexOfLastRow);

  // 📌 Sorting handler
  const handleSort = (key) => {
    setSortConfig((prev) => {
      if (prev.key === key) {
        return { key, direction: prev.direction === "asc" ? "desc" : "asc" };
      }
      return { key, direction: "asc" };
    });
  };





  // Handle loading state
  if (!isDashboard && isLoading) {
    return (
      <section className="rounded-lg p-6">
        <div className="flex justify-center items-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="ml-2 text-gray-600">Loading daily tasks...</span>
        </div>
      </section>
    );
  }

  // Handle error state
  if (!isDashboard && isError) {
    return (
      <section className="rounded-lg p-6">
        <div className="text-center text-red-600">
          <p className="font-medium">Failed to load daily tasks</p>
          <p className="text-sm text-gray-500 mt-1">Please try refreshing the page</p>
        </div>
      </section>
    );
  }

  // Empty state for full page - only when no data at all AND no search term
  if (!isDashboard && data.length === 0 && !search.trim()) {
    return (
      <section className="rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">Today's Tasks</h2>
        </div>
        
        <div className="text-center py-12">
          <CheckSquare size={48} className="mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-500">No daily tasks available at the moment</p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg">
      {/* Header - Always show, but button only on full page */}
     <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-2xl cursor-pointer">
            Today's Task
          </h2>
          <div className="flex gap-4 text-sm text-gray-600">
            <button className="flex items-center gap-1 hover:text-cyan-600">
              View All <ExternalLink size={16} />
            </button>
            <button className="flex items-center gap-1 hover:text-cyan-600">
              Filter <Filter size={16} />
            </button>
            <button className="flex items-center gap-1 hover:text-cyan-600">
              Download PDF <Download size={16} />
            </button>
          </div>
        </div>

      

      {/* Conditional Search and Filter Controls - Only show on full page */}
      {!isDashboard && (
        <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
          <div className="relative w-full md:w-1/3">
            <Search size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <div className="flex items-center gap-3">
            <select
              className="border border-gray-300 px-3 py-2 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={rowsPerPage}
              onChange={(e) => {
                setRowsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              {[4, 8, 12, 20].map((n) => (
                <option key={n} value={n}>
                  {n} rows
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
   
      {/* Table */}
      <div className="overflow-x-auto scrollbar-hide rounded-2xl">
        <table className=" w-full text-sm">
          {/* Conditional Table Header - Only show on full page */}
        
            <thead>
              <tr className="bg-[#FAFBFC] text-gray-700">
                <th className="px-6 py-6 text-sm text-center whitespace-nowrap">
                  <CheckSquare size={18} />
                </th>
                <th 
                  className="px-6 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('name')}
                >
                  Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-10 py-6 text-sm text-left whitespace-nowrap">Promises</th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.portal')}
                >
                  Online Portal Checked {sortConfig.key === 'morning.portal' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.whatsapp')}
                >
                  Whatsapp Status/ Post in Group {sortConfig.key === 'morning.whatsapp' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.email')}
                >
                  Email Working {sortConfig.key === 'morning.email' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.buyers')}
                >
                  Buyers Working {sortConfig.key === 'morning.buyers' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.sellers')}
                >
                  Sellers Working {sortConfig.key === 'morning.sellers' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th 
                  className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap"
                  onClick={() => handleSort('morning.met')}
                >
                  Meeting {sortConfig.key === 'morning.met' && (sortConfig.direction === 'asc' ? '▲' : '▼')}
                </th>
                <th className="px-20 py-6 text-sm text-left whitespace-nowrap">Notes</th>
              </tr>
            </thead>
          
          <tbody className="">
            {currentRows.length === 0 ? (
              <tr>
                <td colSpan={isDashboard ? 10 : 10} className="px-6 py-12 text-center">
                  <div className="flex flex-col items-center">
                    <CheckSquare size={48} className="text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      {search.trim() ? 'No matching tasks found' : 'No tasks found'}
                    </h3>
                    <p className="text-gray-500">
                      {search.trim() ? `Try adjusting your search term "${search}"` : 'Get started by adding your first daily task'}
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              currentRows.map((person, idx) => (
                <React.Fragment key={idx}>
                  <tr className="bg-[#FFF4BD] border-b">
                    <td className="px-6 py-4 text-center" rowSpan={2}>
                      <CheckSquare size={18} className="text-blue-500" />
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap" rowSpan={2}>
                      {person.name}
                    </td>
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{person.morning.commitment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.morning.portal}</td>
                    <td className="px-6 py-4 font-semibold whitespace-nowrap">{person.morning.whatsapp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.morning.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.morning.buyers}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.morning.sellers}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.morning.met}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap place-items-center">
                      <div className="relative group">
                        <NotebookPen 
                          size={18} 
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                          onClick={() => handleNotesClick(person.notes)}
                        />
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-48">
                          <div className="truncate">
                            {person.notes || "No notes available"}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>

                  <tr className="bg-[#FFC6C7] border-b">
                    <td className="px-6 py-4 font-medium whitespace-nowrap">{person.evening.commitment}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.evening.portal}</td>
                    <td className="px-6 py-4 font-semibold whitespace-nowrap">{person.evening.whatsapp}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.evening.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.evening.buyers}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.evening.sellers}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{person.evening.met}</td>
                    <td className="px-6 py-4 text-center whitespace-nowrap place-items-center">
                      <div className="relative group">
                        <NotebookPen 
                          size={18} 
                          className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                          onClick={() => handleNotesClick(person.notes)}
                        />
                        {/* Hover tooltip */}
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-48">
                          <div className="truncate">
                            {person.notes || "No notes available"}
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Conditional Pagination - Only show on full page */}
      {!isDashboard && (
        <div className="flex justify-between items-center mt-4 text-sm text-gray-600">
          <span>
            Showing {Math.min((currentPage - 1) * rowsPerPage + 1, displayData.length)} -{" "}
            {Math.min(currentPage * rowsPerPage, displayData.length)} of{" "}
            {displayData.length}
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
              disabled={currentPage * rowsPerPage >= displayData.length}
              onClick={() => setCurrentPage((p) => p + 1)}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Notes Popup Modal */}
      {isNotesPopupOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-white  px-6 py-4 flex justify-between items-center rounded-t-lg">
              <h2 className="text-xl font-semibold flex items-center gap-2">
                <NotebookPen size={20} className="text-blue-500" />
                Task Notes
              </h2>
              <button
                onClick={() => {
                  setIsNotesPopupOpen(false);
                  setSelectedNotes("");
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6 ">
             <div className="text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {selectedNotes}
                </div>
            </div>

            {/* Footer */}
            <div className=" px-6 py-4  rounded-b-lg">
              <div className="flex justify-end">
                <button
                  onClick={() => {
                    setIsNotesPopupOpen(false);
                    setSelectedNotes("");
                  }}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hide scrollbar style */}
      <style>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </section>
  );
};

export default TodaysTask;
