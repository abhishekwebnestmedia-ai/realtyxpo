import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import DashboardLayout from "./pages/DashboardLayout";
import OverviewDashboard from "./components/OverviewDashboard";
import DailyPlan from "./pages/Internal_Pages/DailyPlan";
import AllLeads from "./pages/Internal_Pages/AllLeads";
import Inventory from "./pages/Internal_Pages/Inventory";
import ProjectsWorking from "./pages/Internal_Pages/ProjectsWorking";
import BrokersRequirements from "./pages/Internal_Pages/BrokersRequirements";
import MyTeam from "./pages/Internal_Pages/MyTeam";
import FindOpportunity from "./pages/Internal_Pages/FindOpportunity";
import LearnGrow from "./pages/Internal_Pages/LearnGrow";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
const App = () => {

  return (
    <AuthProvider>
    <Router>
      <Routes>
        {/* Login Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Dashboard Routes */}
           <Route
            path="/"
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
          <Route index element={<OverviewDashboard />} />
          <Route path="daily-plan" element={<DailyPlan />} />
          <Route path="all-leads" element={<AllLeads />} />
          <Route path="inventory" element={<Inventory />} />
          <Route path="projects-working" element={<ProjectsWorking />} />
          <Route path="brokers-requirements" element={<BrokersRequirements />} />
          <Route path="my-team" element={<MyTeam />} />
          <Route path="find-opportunity" element={<FindOpportunity />} />
          <Route path="learn-grow" element={<LearnGrow />} />
        </Route>
      </Routes>
    </Router>
    </AuthProvider>
  );
};

export default App;
