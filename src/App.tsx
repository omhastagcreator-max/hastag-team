import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import Login from "./pages/Login";
import EmployeeDashboard from "./pages/EmployeeDashboard";
import TasksPage from "./pages/TasksPage";
import WorkRoom from "./pages/WorkRoom";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEmployees from "./pages/AdminEmployees";
import AdminEmployeeDetail from "./pages/AdminEmployeeDetail";
import AdminReports from "./pages/AdminReports";
import AdminProjects from "./pages/AdminProjects";
import NotFound from "./pages/NotFound";
import ClientDashboard from "./pages/ClientDashboard";
import ProjectDetailsLead from "./pages/ProjectDetailsLead";
import SalesDashboard from "./pages/SalesDashboard";

const queryClient = new QueryClient();

import Landing from "./pages/Landing";

// ... existing imports ...

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        
        {/* Employee Routes */}
        <Route path="/employee/dashboard" element={<EmployeeDashboard />} />
        <Route path="/employee/dashboard/projects/:projectId" element={<ProjectDetailsLead />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/workroom" element={<WorkRoom />} />
        
        {/* Admin Routes */}
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/employees" element={<AdminEmployees />} />
        <Route path="/admin/employees/:userId" element={<AdminEmployeeDetail />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/projects" element={<AdminProjects />} />
        
        {/* Client Route */}
        <Route path="/client/dashboard" element={<ClientDashboard />} />
        
        {/* Sales Route */}
        <Route path="/sales/dashboard" element={<SalesDashboard />} />
        
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AnimatedRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
