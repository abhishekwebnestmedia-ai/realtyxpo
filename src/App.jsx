import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/auth";
import { DashboardLayout } from "./pages/dashboard";
import { OverviewDashboard } from "./components/dashboard";
import DailyPlan from "./pages/team/DailyPlan";
import { AllLeads } from "./pages/leads";
import Inventory from "./pages/inventory/Inventory";
import { ProjectsWorking } from "./pages/projects";
import BrokersRequirements from "./pages/resources/BrokersRequirements";
import MyTeam from "./pages/team/MyTeam";
import UserDetails from "./pages/team/UserDetails";
import FindOpportunity from "./pages/resources/FindOpportunity";
import LearnGrow from "./pages/resources/LearnGrow";
import { Profile } from "./pages/profile";
import EditProfile from "./pages/profile/EditProfile";
import { Broadcast } from "./pages/broadcast";
import NotificationsPage from './pages/notifications/NotificationsPage';
import { AuthProvider } from "./context/AuthContext";
import { ProtectedRoute } from "./components/layout";
import { EditLead, AddLead, AddInventry } from "./pages/forms";
import { ToastContainer } from "react-toastify";
import { Toaster } from "react-hot-toast";
import Step3EmployeeDetails from "./pages/forms/components/Stepperformedit/Step3EmployeeDetails";
import Step2ProjectDetails from "./pages/forms/components/Stepperformedit/Step2ProjectDetails";
import Step1SellerDetails from "./pages/forms/components/Stepperformedit/Step1SellerDetails";
import "react-toastify/dist/ReactToastify.css";
import { ScrollToTop } from "./components/ui";
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
            <Route path="team/member/:id" element={<UserDetails />} />
            <Route path="find-opportunity" element={<FindOpportunity />} />
            <Route path="learn-grow" element={<LearnGrow />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="notifications" element={<NotificationsPage />} />
          </Route>
        </Routes>
      </Router>
      <ToastContainer />
      <Toaster 
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </AuthProvider>
  );
};

export default App;
