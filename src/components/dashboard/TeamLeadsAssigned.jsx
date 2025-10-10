import React, { useState, useEffect } from "react";
import { ChevronDown, Filter, FileInput, Loader2 } from "lucide-react";
import api from "../../api/api";

const TeamLeadsAssigned = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch team leads data from API
  const fetchTeamData = async () => {
    try {
      setLoading(true);
      const response = await api.get('/dailyreport');
      
      if (response.data.success) {
        setData(response.data.data);
        setError(null);
      } else {
        setError('Failed to fetch team data');
      }
    } catch (err) {
      console.error('Error fetching team data:', err);
      setError(err.response?.data?.message || 'Failed to fetch team data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamData();
  }, []);

  return (
    <section className="rounded-xl  mt-9">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-semibold text-2xl">Team Leads Assigned</h2>
        <div className="flex gap-5 text-[13px] text-gray-600 font-medium">
          <button className="flex items-center gap-1 hover:text-cyan-600">
            View All <ChevronDown size={16}/>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Filter <Filter size={16}/>
          </button>
          <button className="flex items-center gap-1 hover:text-cyan-600">
            Download PDF <FileInput size={16} />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="max-h-80 overflow-y-auto overflow-hidden rounded-3xl bg-white shadow-sm min-h-[40vh] scrollbar-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-8 w-8 text-blue-600 animate-spin mr-2" />
            <span className="text-gray-600">Loading team data...</span>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-40">
            <div className="text-center">
              <p className="text-red-600 font-medium">{error}</p>
              <button 
                onClick={fetchTeamData}
                className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
              >
                Retry
              </button>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-[#FAFBFC] text-gray-500 border-b sticky top-0 z-10">
              <tr>
                <th className="text-left text-sm px-5 py-6 font-medium">Name</th>
                <th className="text-left text-sm px-5 py-6 font-medium">No. of Leads Assigned</th>
                <th className="text-left text-sm px-5 py-6 font-medium">No. of Hot Leads Assigned</th>
                <th className="text-left text-sm px-5 py-6 font-medium">Daily Plan Status</th>
                <th className="text-left text-sm px-5 py-6 font-medium">No. of visits today</th>
              </tr>
            </thead>
            <tbody className="p-5">
              {data.length > 0 ? (
                data.map((member, i) => (
                  <tr key={member.userId || i} className="border-b last:border-none hover:bg-gray-50">
                    <td className="px-5 py-3">{member.name}</td>
                    <td className="px-5 py-3">{member.assignedLeadCount}</td>
                    <td className="px-5 py-3 text-red-500">{member.leadStats?.Hot || 0}</td>
                    <td className="px-5 py-3">
                      <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-xs font-medium">
                        {member.DailyPlanStatus}/10
                      </span>
                    </td>
                    <td className="px-5 py-3">{member.meetingVisits}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-5 py-8 text-center text-gray-500">
                    No team members found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
};

export default TeamLeadsAssigned;
