import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { AdminScreenMonitor } from '@/components/AdminScreenMonitor';
import { CompanyMetricsCards, OverdueTasksAdmin, AtRiskProjects, ClientOverviewGrid } from '@/components/RoleSpecPanels';
import { EmployeePerformancePanel } from '@/components/Admin/EmployeePerformancePanel';
import { TaskCalendar } from '@/components/TaskCalendar';
import { Task } from '@/hooks/useTasks';

export default function AdminDashboard() {
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAdminData = async () => {
      const { data: allTasksData } = await supabase.from('project_tasks').select('*').order('created_at', { ascending: false }).limit(200);
      if (allTasksData) setAdminTasks(allTasksData as Task[]);
    };

    fetchAdminData();
  }, []);

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Admin Overview</h1>
            <p className="text-sm text-muted-foreground mt-1">Spot what's wrong, fast.</p>
          </div>

          {/* TOP — single row of metrics, scannable in <3s */}
          <CompanyMetricsCards />

          {/* MIDDLE — what's wrong */}
          <div className="grid md:grid-cols-2 gap-4">
            <OverdueTasksAdmin />
            <AtRiskProjects />
          </div>

          <div className="mt-4 mb-4">
             <TaskCalendar tasks={adminTasks} />
          </div>

          {/* Employee Performance Panel (New Component) */}
          <EmployeePerformancePanel />

          {/* Bottom-most: client overview + screen monitor (lower priority) */}
          <ClientOverviewGrid />

          <AdminScreenMonitor />
        </div>
      </PageTransition>
    </AppLayout>
  );
}
