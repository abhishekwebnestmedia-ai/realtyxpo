import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import PieChartSection from "./PieChartSection";
import { MembersAttendanceTable } from "../tables";
import OverallLeadsDetails from "./OverallLeadsDetails";
import TeamLeadsAssigned from "./TeamLeadsAssigned";
import TodaysTask from "./TodaysTask";
import FreshLeads from "./FreshLeads";
import { FilePlus2 } from "lucide-react";
import { Filter, Download, ExternalLink } from "lucide-react";
import { AddBulkLead, AssignLeadModal } from "../modals";
import { AuthContext } from "../../context/AuthContext";
import ViewProfile from "../../pages/profile/ViewProfile";

const OverviewDashboard = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [isAddBulkLeadModalOpen, setIsAddBulkLeadModalOpen] = useState(false);
  const [isAssignLeadModalOpen, setIsAssignLeadModalOpen] = useState(false);
  
  // Check if user role is 'user' - if so, show only profile
  const isRegularUser = user?.role === 'user';
  
  // Modal handlers
  const handleAddLead = () => {
    navigate('/all-leads/addLead');
  };
  
  const handleAddBulkLead = () => {
    setIsAddBulkLeadModalOpen(true);
  };
  
  const handleAssignLead = () => {
    setIsAssignLeadModalOpen(true);
  };
  
  return (
    <div className="w-full">
      {/* If user role is 'user', show only their profile */}
      {isRegularUser ? (
        <div className="w-full">
          <h2 className="font-semibold text-2xl mb-4">Personal Dashboard</h2>
          <ViewProfile 
            profileUser={user}
            customHeading="My Profile"
            showEditButton={true}
          />
        </div>
      ) : (
        <>
          {/* Header with buttons - only for admin/manager users */}
          <div className="flex justify-between items-center ">
            <h2 className="font-semibold text-2xl">Overview Dashboard</h2>
            <div className="flex gap-3">
              <button 
                onClick={handleAssignLead}
                className="white-btn"
              >
                Assign Lead +
              </button>
              
              <button 
                onClick={handleAddBulkLead}
                className="btn flex items-center gap-1"
              >
                Add Bulk Lead{" "}
                <span>
                  <FilePlus2 size={14} />
                </span>
              </button>
              <button 
                onClick={handleAddLead}
                className="white-btn flex items-center gap-1"
              >
                Add Lead{" "}
                <span>
                  <FilePlus2 size={14} />
                </span>
              </button>
            </div>
          </div>

          {/* Pie Chart & Attendance Table */}
          <section className="flex justify-between gap-6 bg-white mt-4 p-5 rounded-3xl">
            <div className="w-[40%]">
              <PieChartSection />
            </div>
            <div className="w-[60%]">
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
          
          {/* Modals */}
          <AddBulkLead 
            isOpen={isAddBulkLeadModalOpen} 
            onClose={() => setIsAddBulkLeadModalOpen(false)} 
          />
          <AssignLeadModal 
            isOpen={isAssignLeadModalOpen} 
            onClose={() => setIsAssignLeadModalOpen(false)} 
          />
        </>
      )}
    </div>
  );
};

export default OverviewDashboard;
