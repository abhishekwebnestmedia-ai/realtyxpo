import React from "react";
import { useState } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "../../components/layout";
import { TopBar } from "../../components/ui";
import FollowupReminder from '../../components/ui/FollowupReminder';
import { useNotifications } from '../../hooks/useNotifications';

const FollowupReminderContainer = () => {
  const ctx = useNotifications();
  const reminder = ctx?.followupControls?.reminder || null;
  const snooze = ctx?.followupControls?.snooze || (()=>{});
  const dismiss = ctx?.followupControls?.dismiss || (()=>{});
  return (
    <FollowupReminder reminder={reminder} onSnooze={snooze} onDismiss={dismiss} />
  );
};

// Dev followup emitter removed — no dev-only emit UI should remain in layout

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };
  return (
    <div className="flex h-screen overflow-hidden text-gray-100 bg-gray-900">
      {/* Sidebar */}
      <aside
        className={`
          bg-slate-900 text-white flex-shrink-0 h-full
          transition-[width] duration-300 ease-in-out
          ${isSidebarOpen ? "w-[17.5rem]" : "w-[3.20rem]"}
        `}
        style={{ willChange: "width" }}
      >
        <Sidebar isOpen={isSidebarOpen} />
      </aside>

      {/* Main Content */}
      <main
        className={`flex flex-col flex-1 m-4  overflow-hidden text-gray-900 transition-all duration-300 ease-in-out bg-white rounded-3xl ${
          isSidebarOpen ? "ml-0" : "ml-0"
        }`}
      >
        {/* Top Bar */}
        <TopBar toggleSidebar={toggleSidebar} />

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-5 bg-[#F4F6FF] scrollbar-hidden">
          <FollowupReminderContainer />
          <Outlet /> {/* Page content */}
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;
