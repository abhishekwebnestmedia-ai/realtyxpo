import React, { Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Login } from "./pages/auth";
import { DashboardLayout } from "./pages/dashboard";
import { OverviewDashboard } from "./components/dashboard";
import DailyPlan from "./pages/team/DailyPlan";
import { AllLeads } from "./pages/leads";
import Inventory from "./pages/inventory/Inventory";
import { ProjectsWorking } from "./pages/projects";
import BrokersRequirements from "./pages/resources/BrokersRequirements";
import UserDetails from "./pages/team/UserDetails";
import FindOpportunity from "./pages/resources/FindOpportunity";
import LearnGrow from "./pages/resources/LearnGrow";
import AddBrokerRequirement from "./pages/resources/AddBrokerRequirement";
import EditBrokerRequirement from "./pages/resources/EditBrokerRequirement";
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

// Import role-based routing component
import RoleBasedRoute from "./components/RoleBasedRoute";

// Loading component for lazy-loaded components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-[400px]">
    <div className="text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-gray-500">Loading...</p>
    </div>
  </div>
);

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
            
            {/* Role-based Team Management Routes */}
            <Route 
              path="my-team" 
              element={
                <Suspense fallback={<LoadingSpinner />}>
                  <RoleBasedRoute 
                    adminComponent="AdminMyTeam"
                    userComponent="UserMyTeam"
                    fallbackPath="/dashboard"
                  />
                </Suspense>
              } 
            />
            
            <Route path="team/member/:id" element={<UserDetails />} />
            <Route path="find-opportunity" element={<FindOpportunity />} />
            <Route path="learn-grow" element={<LearnGrow />} />
            <Route path="broadcast" element={<Broadcast />} />
            <Route path="profile" element={<Profile />} />
            <Route path="profile/edit" element={<EditProfile />} />
            <Route path="brokers-requirements/add" element={<AddBrokerRequirement />} />
            <Route path="brokers-requirements/edit/:id" element={<EditBrokerRequirement />} />
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