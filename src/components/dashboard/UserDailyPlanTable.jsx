import React, { useState, useMemo } from "react";
import TokenSearch from '../ui/TokenSearch';
import { useUserAllDailyPlans } from "../../hooks/useDailyTasks";
import { CheckSquare, NotebookPen } from "lucide-react";

const UserDailyPlanTable = ({ userName }) => {
  const { data: dailyPlans = [], isLoading, isError } = useUserAllDailyPlans(userName);

  // Hide plans for internal backup users
  const normalizedUserName = (userName || '').trim().toLowerCase();
  if (normalizedUserName === 'backup' || normalizedUserName === 'backup from everywhere') {
    return null;
  }

  // Search and pagination state
  const [search, setSearch] = useState("");
  const [searchTokens, setSearchTokens] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(8);
  // Notes popup state
  const [isNotesPopupOpen, setIsNotesPopupOpen] = useState(false);
  const [selectedNotes, setSelectedNotes] = useState("");
  const handleNotesClick = (notes) => {
    setSelectedNotes(notes || "No notes available");
    setIsNotesPopupOpen(true);
  };
  // Filtered data
  const filteredPlans = useMemo(() => {
    const tokens = (searchTokens && searchTokens.length) ? searchTokens.map(t => String(t).toLowerCase()) : (search ? [search.toLowerCase()] : []);
    if (!tokens || tokens.length === 0) return dailyPlans;
    return dailyPlans.filter(plan => {
      const hay = Object.values(plan).join(' ').toLowerCase();
      return tokens.every(tok => hay.includes(tok));
    });
  }, [dailyPlans, search, searchTokens]);
  const totalRows = filteredPlans.length;
  const paginatedRows = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage;
    return filteredPlans.slice(startIdx, startIdx + rowsPerPage);
  }, [filteredPlans, currentPage, rowsPerPage]);

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error loading daily plans.</div>;

  return (
    <div className="rounded-lg">
      {/* Search + Rows per page */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-3">
        <TokenSearch
          value={search}
          onChange={(v) => { setSearch(v); setCurrentPage(1); }}
          tokens={searchTokens}
          onTokensChange={(t) => { setSearchTokens(t); setCurrentPage(1); }}
          className="w-full md:w-1/3"
          inputClassName="w-full"
        />
        {/* rows-per-page control removed from header; inline select will be in pagination */}
      </div>
      {/* Table */}
      <div className="overflow-x-auto hide-scrollbar bg-white rounded-tr-3xl rounded-tl-3xl">
        <table className="w-full border-collapse">
        <thead className="sticky top-0 z-20 bg-[#FAFBFC]">
          <tr className="bg-[#FAFBFC] text-gray-700">
            <th className="px-6 py-6 text-sm text-center whitespace-nowrap bg-[#FAFBFC] font-medium theading">S.No</th>
            <th className="px-6 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">
              Date
            </th>
            <th className="px-10 py-6 text-sm text-left whitespace-nowrap bg-[#FAFBFC] font-medium">Promises</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Online Portal Checked</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Whatsapp Status/ Post in Group</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Email Working</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Buyers Working</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Sellers Working</th>
            <th className="px-10 py-6 text-sm text-left cursor-pointer select-none hover:bg-gray-200 transition-colors whitespace-nowrap bg-[#FAFBFC] font-medium">Meeting</th>
            <th className="px-20 py-6 text-sm text-left whitespace-nowrap bg-[#FAFBFC] font-medium">Notes</th>
          </tr>
        </thead>
        <tbody>
          {paginatedRows.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-12 text-center">No daily plans found.</td>
            </tr>
          ) : (
            paginatedRows.map((plan, idx) => (
              <React.Fragment key={plan._id || idx}>
                <tr className="bg-[#FFF4BD]">
                  <td className="px-6 py-4 text-center" rowSpan={2}>
                    {(currentPage - 1) * rowsPerPage + idx + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-800 whitespace-nowrap" rowSpan={2}>
                    {plan.date}
                  </td>
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    Morning Commitments
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.morningCommitment?.onlinePortalChecked ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.morningCommitment?.whatsappStatus ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.morningCommitment?.emailWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.morningCommitment?.buyersWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.morningCommitment?.sellersWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.meetingVisits ?? '-'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap place-items-center">
                    <div className="relative group">
                      <NotebookPen 
                        size={18} 
                        className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                        onClick={() => handleNotesClick(plan.addNotes)}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-48">
                        <div className="truncate">
                          {plan.addNotes || "No notes available"}
                        </div>
                      </div>
                    </div>
                  </td>
                </tr>
                <tr className="bg-[#FFC6C7]">
                  <td className="px-6 py-4 font-medium whitespace-nowrap">
                    Evening Achievements
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.eveningAchievements?.onlinePortalChecked ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.eveningAchievements?.whatsappStatus ? 'Yes' : 'No'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.eveningAchievements?.emailWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.eveningAchievements?.buyersWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.eveningAchievements?.sellersWorking ?? '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{plan.meetingVisits ?? '-'}</td>
                  <td className="px-6 py-4 text-center whitespace-nowrap place-items-center">
                    <div className="relative group">
                      <NotebookPen 
                        size={18} 
                        className="text-blue-500 cursor-pointer hover:text-blue-700 transition-colors" 
                        onClick={() => handleNotesClick(plan.addNotes)}
                      />
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none max-w-48">
                        <div className="truncate">
                          {plan.addNotes || "No notes available"}
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
      {/* Pagination below table, no internal scroll */}
  <div className="flex justify-between items-center mt-4 mb-1 text-sm text-gray-600">
        <span className="flex items-center gap-2">
          <span>Showing {(currentPage - 1) * rowsPerPage + 1} -</span>
          <select
            value={rowsPerPage}
            onChange={(e) => { setRowsPerPage(Number(e.target.value)); setCurrentPage(1); }}
            className="border rounded px-2 py-1 text-sm"
          >
            {[4,8,12,20].map(n => <option key={n} value={n}>{n}</option>)}
          </select>
          <span>of {totalRows}</span>
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
            disabled={currentPage * rowsPerPage >= totalRows}
            onClick={() => setCurrentPage((p) => p + 1)}
          >
            Next
          </button>
        </div>
      </div>
      {/* Notes Popup Modal - same as TodaysTask */}
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserDailyPlanTable;
