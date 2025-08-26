import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import SidebarMenu from "./components/Sidebar";
import TopBar from "./components/TopBar";
import OverviewDashboard from "./components/OverviewDashboard";
import FreshLeads from "./components/FreshLeads";
import TodaysTask from "./components/TodaysTask";
import AllBuyers from "./pages/Internal_Pages/AllBuyers";
import DailyPlan from "./pages/Internal_Pages/DailyPlan";
import AllLeads from "../src/pages/Internal_Pages/AllLeads";
import './App.css';
const App = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  return (
    <Router>
      <div className="flex h-screen bg-gray-900 text-gray-100 overflow-hidden">
        <aside
          className={`
    bg-slate-900 text-white flex-shrink-0 h-full
    transition-[width] duration-300 ease-in-out
    ${isSidebarOpen ? "w-68" : "w-14"}
  `}
          style={{ willChange: "width" }}
        >
          <SidebarMenu isOpen={isSidebarOpen} />
        </aside>

        <main className="flex flex-col flex-1 overflow-hidden bg-white text-gray-900 rounded-3xl m-5 transition-all duration-300 ease-in-out">
          <TopBar toggleSidebar={toggleSidebar} />

          <div className="flex-1 overflow-y-auto px-5 pt-5 pb-5 bg-[#F4F6FF] scrollbar-hidden ">
            <Routes>
              <Route path="/" element={<OverviewDashboard />} />
              <Route
                path="/fresh-leads"
                element={
                  <>
                    <h2 className="font-semibold text-2xl mb-4">Fresh Leads</h2>
                    <FreshLeads />
                  </>
                }
              />
              <Route
                path="/daily-plan"
                element={
                  <>
                    <DailyPlan />
                  </>
                }
              />
              <Route
                path="/all-leads"
                element={
                  <>
                    <AllLeads />
                  </>
                }
              />
              <Route
                path="/todays-task"
                element={
                  <>
                    <h2 className="font-semibold text-2xl mb-4">
                      Today's Tasks
                    </h2>
                    <TodaysTask />
                  </>
                }
              />
            </Routes>
          </div>
        </main>
      </div>
    </Router>
  );
};

export default App;
