import SidebarMenu from '../../components/Sidebar';
import TopBar from '../../components/TopBar';
import PieChartSection from '../../components/PieChartSection';
import MembersAttendanceTable from '../../components/MembersAttendanceTable';
import OverallLeadsDetails from '../../components/OverallLeadsDetails';
import TeamLeadsAssigned from '../../components/TeamLeadsAssigned';

const OverviewDashboard = () => {
  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">

      {/* Full SidebarMenu on left */}
      <aside className="w-64 bg-slate-900 text-white flex-shrink-0">
        <SidebarMenu />
      </aside>

      {/* Right panel with margins top & bottom, scrollable content, white background */}
      <main
        className="flex flex-col flex-1 bg-white text-gray-900 rounded-lg mx-5 my-5 shadow-lg  "
        style={{ maxHeight: 'calc(100vh - 40px)' }} /* maintain margins */
      >
        {/* Scroll container */}
        <div className="flex flex-col flex-1 overflow-y-auto space-y-6 p-6 scrollbar-hidden">

          <TopBar />

          <div className="flex justify-between items-center">
            <h2 className="font-semibold text-xl">Overview Dashboard</h2>
            <div className="flex gap-3">
              <button className="rounded border border-cyan-600 text-cyan-600 px-3 py-1 text-sm hover:bg-cyan-600 hover:text-white">
                Assign Lead +
              </button>
              <button className="rounded bg-cyan-600 text-white px-3 py-1 text-sm hover:bg-cyan-700 flex items-center gap-1">
                Add Bulk Lead <span>📤</span>
              </button>
              <button className="rounded border border-cyan-600 text-cyan-600 px-3 py-1 text-sm hover:bg-cyan-600 hover:text-white flex items-center gap-1">
                Add Lead <span>➕</span>
              </button>
            </div>
          </div>

          <section className="flex gap-6 flex-wrap">
            <PieChartSection />
            <MembersAttendanceTable />
          </section>
          <OverallLeadsDetails />
          <TeamLeadsAssigned />
        </div>
      </main>
    </div>
  );
};

export default OverviewDashboard;
