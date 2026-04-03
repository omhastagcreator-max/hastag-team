import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, ListTodo, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { AdminScreenMonitor } from '@/components/AdminScreenMonitor';

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
      const { data: tasks } = await supabase.from('tasks').select('user_id, created_at').gte('created_at', todayIso);

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

          const userTasks = (tasks || []).filter((t) => t.user_id === p.user_id);

          return {
            user_id: p.user_id,
            name: p.name || p.email,
            email: p.email,
            todayHours: Math.max(0, totalMinutes / 60),
            todayTasks: userTasks.length,
            lastActive,
          };
        });

      setEmployees(summaries);
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
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm">Admin Overview</h1>

          <div className="grid grid-cols-3 gap-6">
            <MotionCard delay={0.1}>
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <Users className="h-8 w-8 mx-auto mb-3 text-primary drop-shadow-md" />
                <p className="text-3xl font-bold text-foreground">{employees.length}</p>
                <p className="text-sm text-muted-foreground mt-1">Employees</p>
              </CardContent>
            </MotionCard>
            <MotionCard delay={0.2}>
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <Clock className="h-8 w-8 mx-auto mb-3 text-accent drop-shadow-md" />
                <p className="text-3xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
                <p className="text-sm text-muted-foreground mt-1">Today's Hours</p>
              </CardContent>
            </MotionCard>
            <MotionCard delay={0.3}>
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <ListTodo className="h-8 w-8 mx-auto mb-3 text-primary drop-shadow-md" />
                <p className="text-3xl font-bold text-foreground">{totalTasks}</p>
                <p className="text-sm text-muted-foreground mt-1">Tasks Today</p>
              </CardContent>
            </MotionCard>
          </div>

          <AdminScreenMonitor />

          <MotionCard delay={0.4} className="mt-6">
            <CardHeader className="border-b border-border/50 bg-background/20 rounded-t-lg">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Employee Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <p className="text-muted-foreground text-center py-8 animate-pulse">Loading data...</p>
              ) : employees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No employees found.</p>
              ) : (
                <div className="flex flex-col divide-y divide-border/50">
                  {employees.map((emp) => (
                    <div
                      key={emp.user_id}
                      className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition-colors group"
                      onClick={() => navigate(`/admin/employees/${emp.user_id}`)}
                    >
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">{emp.name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{emp.email}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span className="text-foreground font-medium">{emp.todayHours.toFixed(1)}h</span>
                        <Badge variant="secondary" className="glass transition-colors">{emp.todayTasks} tasks</Badge>
                        {emp.todayHours > 0 && (
                          <Badge className="bg-primary/20 text-primary hover:bg-primary/30 border-0 shadow-sm shadow-primary/20">
                            <Activity className="h-3 w-3 mr-1" /> Active
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </MotionCard>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
