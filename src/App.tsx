import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate, useLocation } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Eager — auth-critical routes
import Login from "./pages/Login";
import Landing from "./pages/Landing";
import UpdatePassword from "./pages/UpdatePassword";
import NotFound from "./pages/NotFound";

// Lazy — code-split for Vercel Free
const EmployeeDashboard = lazy(() => import("./pages/EmployeeDashboard"));
const TasksPage = lazy(() => import("./pages/TasksPage"));
const WorkRoom = lazy(() => import("./pages/WorkRoom"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminEmployees = lazy(() => import("./pages/AdminEmployees"));
const AdminEmployeeDetail = lazy(() => import("./pages/AdminEmployeeDetail"));
const AdminClients = lazy(() => import("./pages/AdminClients"));
const AdminClientDetail = lazy(() => import("./pages/AdminClientDetail"));
const AdminReports = lazy(() => import("./pages/AdminReports"));
const AdminProjects = lazy(() => import("./pages/AdminProjects"));
const ClientDashboard = lazy(() => import("./pages/ClientDashboard"));
const ProjectDetailsLead = lazy(() => import("./pages/ProjectDetailsLead"));
const SalesDashboard = lazy(() => import("./pages/SalesDashboard"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Bounded refetch to keep Supabase Free quota happy
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const RouteFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
  </div>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<RouteFallback />}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Employee */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allow={["employee", "admin"]}>
              <EmployeeDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/employee/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route
          path="/dashboard/projects/:projectId"
          element={
            <ProtectedRoute allow={["employee", "admin"]}>
              <ProjectDetailsLead />
            </ProtectedRoute>
          }
        />
        <Route
          path="/employee/dashboard/projects/:projectId"
          element={
            <ProtectedRoute allow={["employee", "admin"]}>
              <ProjectDetailsLead />
            </ProtectedRoute>
          }
        />
        <Route
          path="/tasks"
          element={
            <ProtectedRoute allow={["employee", "admin"]}>
              <TasksPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/workroom"
          element={
            <ProtectedRoute>
              <WorkRoom />
            </ProtectedRoute>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        <Route
          path="/admin/employees"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminEmployees />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/employees/:userId"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminEmployeeDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminClients />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/clients/:clientId"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminClientDetail />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/reports"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminReports />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/projects"
          element={
            <ProtectedRoute allow={["admin"]}>
              <AdminProjects />
            </ProtectedRoute>
          }
        />

        {/* Client */}
        <Route
          path="/client"
          element={
            <ProtectedRoute allow={["client"]}>
              <ClientDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/client/dashboard" element={<Navigate to="/client" replace />} />

        {/* Sales */}
        <Route
          path="/sales"
          element={
            <ProtectedRoute allow={["sales"]}>
              <SalesDashboard />
            </ProtectedRoute>
          }
        />
        <Route path="/sales/dashboard" element={<Navigate to="/sales" replace />} />

        <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
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
