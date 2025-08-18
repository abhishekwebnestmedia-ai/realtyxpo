import SidebarMenu from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import PieChartSection from '../../components/PieChartSection';
import MembersAttendanceTable from '../../components/MembersAttendanceTable';
import OverallLeadsDetails from '../../components/OverallLeadsDetails';
import TeamLeadsAssigned from '../../components/TeamLeadsAssigned';
import TodaysTask from '../../components/TodaysTask';
import { FilePlus2 } from 'lucide-react';
import FreshLeads from '../../components/FreshLeads'
const OverviewDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 ">

      {/* Full SidebarMenu on left */}
      <aside className="w-[15%] bg-slate-900 text-white flex-shrink-0">
        <SidebarMenu />
      </aside>

      {/* Right panel with margins top & bottom, scrollable content, white background */}
      <main
        className="flex flex-col w-[80%] flex-1 bg-white text-gray-900 rounded-3xl m-5  "
        style={{ maxHeight: 'calc(100vh - 40px)'}} /* maintain margins */
      >
        {/* Scroll container */}
        <div className="flex flex-col flex-1 overflow-y-auto space-y-6 rounded-3xl bg-[#F4F6FF]  scrollbar-hidden">

          <TopBar />

          <div className="mx-5">
            <div className="flex justify-between items-center ">
            <h2 className="font-semibold text-2xl">Overview Dashboard</h2>
            <div className="flex gap-3">
              <button className="rounded border border-cyan-600 text-cyan-600 px-3 py-1 text-sm hover:bg-cyan-600 hover:text-white">
                Assign Lead +
              </button>
              <button className="rounded bg-cyan-600 text-white px-3 py-1 text-sm hover:bg-cyan-700 flex items-center gap-1">
                Add Bulk Lead <span><FilePlus2  size={14}/></span>
              </button>
              <button className="rounded border border-cyan-600 text-cyan-600 px-3 py-1 text-sm hover:bg-cyan-600 hover:text-white flex items-center gap-1">
                Add Lead <span><FilePlus2 size={14} /></span>
              </button>
            </div>
          </div>

          <section className="flex justify-between gap-6 bg-white mt-4 p-5 rounded-3xl">
            <PieChartSection />
            <MembersAttendanceTable />
          </section>
          <OverallLeadsDetails />
          <TeamLeadsAssigned />
          <TodaysTask></TodaysTask>
          <FreshLeads></FreshLeads>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OverviewDashboard;
