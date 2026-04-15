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

interface EmployeeSummary {
  user_id: string;
  name: string;
  email: string;
  todayHours: number;
  todayTasks: number;
  lastActive: string | null;
}

export default function AdminDashboard() {
  const [employees, setEmployees] = useState<EmployeeSummary[]>([]);
  const [timeline, setTimeline] = useState<{ type: string; text: string; time: string; user: string | undefined }[]>([]);
  const [taskStats, setTaskStats] = useState<{name: string; value: number; color: string}[]>([]);
  const [adminTasks, setAdminTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEmployees = async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayIso = today.toISOString();

      const { data: profiles } = await supabase.from('profiles').select('user_id, name, email');
      const { data: roles } = await supabase.from('user_roles').select('user_id, role');
      const { data: sessions } = await supabase.from('sessions').select('user_id, start_time, end_time, break_time').gte('start_time', todayIso);
      const { data: tasks } = await supabase.from('project_tasks').select('assigned_to, created_at').gte('created_at', todayIso);
      const { data: allTasksData } = await supabase.from('project_tasks').select('*').order('created_at', { ascending: false }).limit(200);
      if (allTasksData) setAdminTasks(allTasksData as Task[]);

      const employeeUserIds = (roles || []).filter((r) => r.role === 'employee').map((r) => r.user_id);

      const summaries: EmployeeSummary[] = (profiles || [])
        .filter((p) => employeeUserIds.includes(p.user_id))
        .map((p) => {
          const userSessions = (sessions || []).filter((s) => s.user_id === p.user_id);
          let totalMinutes = 0;
          let lastActive: string | null = null;

          userSessions.forEach((s) => {
            const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
            const start = new Date(s.start_time).getTime();
            totalMinutes += (end - start) / 60000 - (s.break_time || 0);
            if (!lastActive || s.start_time > lastActive) lastActive = s.end_time || s.start_time;
          });

          const userTasks = (tasks || []).filter((t) => t.assigned_to === p.user_id);

          return {
            user_id: p.user_id,
            name: p.name || p.email,
            email: p.email,
            todayHours: Math.max(0, totalMinutes / 60),
            todayTasks: userTasks.length,
            lastActive,
          };
        });

      // Construct Timeline Feed
      const activities: { type: string; text: string; time: string; user: string | undefined }[] = [];
      (tasks || []).forEach(t => activities.push({ type: 'task', text: 'Task Created', time: t.created_at, user: (profiles||[]).find(p=>p.user_id===t.assigned_to)?.name }));
      (sessions || []).forEach(s => activities.push({ type: 'session', text: 'Session Started', time: s.start_time, user: (profiles||[]).find(p=>p.user_id===s.user_id)?.name }));
      
      const { data: projTasks } = await supabase.from('project_tasks').select('status');
      let pending = 0, ongoing = 0, done = 0;
      (projTasks||[]).forEach(pt => {
         if (pt.status === 'pending') pending++;
         else if (pt.status === 'ongoing') ongoing++;
         else if (pt.status === 'done') done++;
      });

      setTaskStats([
        { name: 'Done', value: done, color: '#22c55e' },
        { name: 'Ongoing', value: ongoing, color: '#f59e0b' },
        { name: 'Pending', value: pending, color: '#64748b' }
      ]);

      setTimeline(activities.sort((a,b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 15));
      setEmployees(summaries.sort((a,b) => b.todayHours - a.todayHours));
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  const totalHours = employees.reduce((sum, e) => sum + e.todayHours, 0);
  const totalTasks = employees.reduce((sum, e) => sum + e.todayTasks, 0);

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
