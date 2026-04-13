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

const LazyRoute = ({ element: Component, roles }: { element: React.ElementType, roles?: ("admin" | "employee" | "client" | "sales")[] }) => (
  <Suspense fallback={<RouteFallback />}>
    {roles ? (
      <ProtectedRoute allow={roles}>
        <Component />
      </ProtectedRoute>
    ) : (
      <ProtectedRoute>
        <Component />
      </ProtectedRoute>
    )}
  </Suspense>
);

const AnimatedRoutes = () => {
  const location = useLocation();
  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/update-password" element={<UpdatePassword />} />

        {/* Employee */}
        <Route path="/dashboard" element={<LazyRoute element={EmployeeDashboard} roles={["employee"]} />} />
        <Route path="/employee/dashboard" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard/projects/:projectId" element={<LazyRoute element={ProjectDetailsLead} roles={["employee", "admin"]} />} />
        <Route path="/employee/dashboard/projects/:projectId" element={<LazyRoute element={ProjectDetailsLead} roles={["employee", "admin"]} />} />
        <Route path="/tasks" element={<LazyRoute element={TasksPage} roles={["employee", "admin"]} />} />
        <Route path="/workroom" element={<LazyRoute element={WorkRoom} />} />

        {/* Admin */}
        <Route path="/admin" element={<LazyRoute element={AdminDashboard} roles={["admin"]} />} />
        <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />
        <Route path="/admin/employees" element={<LazyRoute element={AdminEmployees} roles={["admin"]} />} />
        <Route path="/admin/employees/:userId" element={<LazyRoute element={AdminEmployeeDetail} roles={["admin"]} />} />
        <Route path="/admin/clients" element={<LazyRoute element={AdminClients} roles={["admin"]} />} />
        <Route path="/admin/clients/:clientId" element={<LazyRoute element={AdminClientDetail} roles={["admin"]} />} />
        <Route path="/admin/reports" element={<LazyRoute element={AdminReports} roles={["admin"]} />} />
        <Route path="/admin/projects" element={<LazyRoute element={AdminProjects} roles={["admin"]} />} />

        {/* Client */}
        <Route path="/client" element={<LazyRoute element={ClientDashboard} roles={["client"]} />} />
        <Route path="/client/dashboard" element={<Navigate to="/client" replace />} />

        {/* Sales */}
        <Route path="/sales" element={<LazyRoute element={SalesDashboard} roles={["sales"]} />} />
        <Route path="/sales/dashboard" element={<Navigate to="/sales" replace />} />

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
