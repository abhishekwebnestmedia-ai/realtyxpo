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
import EditLead from "./pages/Add_delete_pages/EditLead";
import AddLead from "./pages/Add_delete_pages/AddLead";
import AddInventry from "./pages/Add_delete_pages/AddInventry";
import { ToastContainer } from "react-toastify";
import Step3EmployeeDetails from "./pages/Add_delete_pages/Stepperformedit/Step3EmployeeDetails";
import Step2ProjectDetails from "./pages/Add_delete_pages/Stepperformedit/Step2ProjectDetails";
import Step1SellerDetails from "./pages/Add_delete_pages/Stepperformedit/Step1SellerDetails";
import "react-toastify/dist/ReactToastify.css";
import ScrollToTop from "./components/ScrollToTop";
const App = () => {
  return (
    <AuthProvider>
      <Router>
        <ScrollToTop />
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
            <Route path="all-leads/addLead" element={<AddLead />} />
            <Route path="all-leads/:id" element={<EditLead />} />
            <Route path="inventory" element={<Inventory />} />
            <Route
              path="inventory/seller-details/:id"
              element={<Step1SellerDetails />}
            />
            <Route
              path="inventory/project-details/:id"
              element={<Step2ProjectDetails />}
            />
            <Route
              path="inventory/employee-details/:id"
              element={<Step3EmployeeDetails />}
            />
            <Route
              path="inventory/addInventory"
              element={<AddInventry />}
            ></Route>
            <Route path="projects-working" element={<ProjectsWorking />} />
            <Route
              path="brokers-requirements"
              element={<BrokersRequirements />}
            />
            <Route path="my-team" element={<MyTeam />} />
            <Route path="find-opportunity" element={<FindOpportunity />} />
            <Route path="learn-grow" element={<LearnGrow />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
    </AuthProvider>
  );
};

export default App;
