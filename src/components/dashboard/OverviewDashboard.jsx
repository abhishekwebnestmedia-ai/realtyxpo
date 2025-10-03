import PieChartSection from "./PieChartSection";
import { MembersAttendanceTable } from "../tables";
import OverallLeadsDetails from "./OverallLeadsDetails";
import TeamLeadsAssigned from "./TeamLeadsAssigned";
import TodaysTask from "./TodaysTask";
import FreshLeads from "./FreshLeads";
import { FilePlus2 } from "lucide-react";
import { Filter, Download, ExternalLink } from "lucide-react";

const OverviewDashboard = () => {
  
  return (
    <div className="w-full">
      {/* Header with buttons */}
      <div className="flex justify-between items-center ">
        <h2 className="font-semibold text-2xl">Overview Dashboard</h2>
        <div className="flex gap-3">
          <button className="white-btn">
            Assign Lead +
          </button>
          
          <button className="btn flex items-center gap-1">
            Add Bulk Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
          <button className="white-btn flex items-center gap-1">
            Add Lead{" "}
            <span>
              <FilePlus2 size={14} />
            </span>
          </button>
        </div>
      </div>

      {/* Pie Chart & Attendance Table */}
      <section className="flex justify-between gap-6 bg-white mt-4 p-5 rounded-3xl">
  <div className="w-1/2">
    <PieChartSection />
  </div>
  <div className="w-1/2">
    <MembersAttendanceTable />
  </div>
</section>


      {/* Additional Sections */}
      <section>
        <OverallLeadsDetails />
      </section>
      <TeamLeadsAssigned />

      <section className="mt-9">
        
        <TodaysTask isDashboard={true} />
      </section>
      <FreshLeads />
    </div>
  );
};

export default OverviewDashboard;
