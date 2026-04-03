import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';
import { useAuth } from '@/contexts/AuthContext';

interface AppLayoutProps {
  children: ReactNode;
  requiredRole?: 'admin' | 'employee' | 'client' | 'sales';
}

export function AppLayout({ children, requiredRole }: AppLayoutProps) {
  const { user, role, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : role === 'client' ? '/client' : role === 'sales' ? '/sales' : '/dashboard'} replace />;
  }

  return (
    <SidebarProvider>
      <div className="fixed inset-0 z-[0] bg-gradient-to-br from-primary/5 via-accent/5 to-purple-500/5 dark:from-primary/10 dark:via-accent/10 dark:to-purple-900/10 animate-gradient-xy pointer-events-none" />
      <div className="min-h-screen flex w-full bg-transparent relative z-10">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center border-b border-border/50 glass-panel px-4 sticky top-0 z-20">
            <SidebarTrigger />
          </header>
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
