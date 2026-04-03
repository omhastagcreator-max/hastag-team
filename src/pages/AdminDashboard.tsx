import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, Clock, ListTodo, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

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
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Admin Overview</h1>

        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4 text-center">
              <Users className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{employees.length}</p>
              <p className="text-xs text-muted-foreground">Employees</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <Clock className="h-6 w-6 mx-auto mb-2 text-accent" />
              <p className="text-2xl font-bold text-foreground">{totalHours.toFixed(1)}h</p>
              <p className="text-xs text-muted-foreground">Today's Hours</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <ListTodo className="h-6 w-6 mx-auto mb-2 text-primary" />
              <p className="text-2xl font-bold text-foreground">{totalTasks}</p>
              <p className="text-xs text-muted-foreground">Tasks Today</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Employee Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="text-muted-foreground text-center py-4">Loading...</p>
            ) : employees.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No employees found.</p>
            ) : (
              <div className="space-y-3">
                {employees.map((emp) => (
                  <div
                    key={emp.user_id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors"
                    onClick={() => navigate(`/admin/employees/${emp.user_id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{emp.name}</p>
                      <p className="text-xs text-muted-foreground">{emp.email}</p>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">{emp.todayHours.toFixed(1)}h</span>
                      <Badge variant="secondary">{emp.todayTasks} tasks</Badge>
                      {emp.todayHours > 0 && (
                        <Badge className="bg-primary/10 text-primary border-0">
                          <Activity className="h-3 w-3 mr-1" /> Active
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
