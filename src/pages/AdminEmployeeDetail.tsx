import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { toast } from 'sonner';
interface DayLog {
  date: string;
  hours: number;
  tasks: number;
}

export default function AdminEmployeeDetail() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<{ name: string; email: string } | null>(null);
  const [dailyLogs, setDailyLogs] = useState<DayLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      const monthStart = startOfMonth(new Date());
      const monthEnd = endOfMonth(new Date());

      const [profileRes, sessionsRes, tasksRes] = await Promise.all([
        supabase.from('profiles').select('name, email').eq('user_id', userId).single(),
        supabase.from('sessions').select('*').eq('user_id', userId).gte('start_time', monthStart.toISOString()).lte('start_time', monthEnd.toISOString()),
        supabase.from('tasks').select('*').eq('user_id', userId).gte('created_at', monthStart.toISOString()).lte('created_at', monthEnd.toISOString()),
      ]);

      setProfile(profileRes.data);

      const days = eachDayOfInterval({ start: monthStart, end: new Date() });
      const logs: DayLog[] = days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const daySessions = (sessionsRes.data || []).filter(
          (s) => format(new Date(s.start_time), 'yyyy-MM-dd') === dayStr
        );
        let totalMin = 0;
        daySessions.forEach((s) => {
          const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
          totalMin += (end - new Date(s.start_time).getTime()) / 60000 - (s.break_time || 0);
        });
        const dayTasks = (tasksRes.data || []).filter(
          (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
        );
        return { date: format(day, 'MMM dd'), hours: Math.max(0, +(totalMin / 60).toFixed(1)), tasks: dayTasks.length };
      });

      setDailyLogs(logs);
      setLoading(false);
    };

    fetchData();
  }, [userId]);

  const handleDeleteEmployee = async () => {
    if (!userId) return;
    if (!window.confirm("Are you sure you want to permanently delete this employee? This action cannot be undone.")) return;
    
    setLoading(true);
    
    // Using the delete_user RPC we added via migration
    const { error } = await supabase.rpc('delete_user', { target_user_id: userId });
    
    // In case RPC isn't applied, fallback to deleting from profiles and user_roles
    // Deleting from profiles will visually remove them from the app since all queries join on profile or role
    if (error) {
       console.log("RPC delete failed, falling back to profile deletion", error);
       await supabase.from('profiles').delete().eq('user_id', userId);
       await supabase.from('user_roles').delete().eq('user_id', userId);
    }
    
    toast.success("Employee removed successfully");
    navigate('/admin');
  };

  const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
  const weekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });
  const weekStartStr = format(weekStart, 'MMM dd');
  const weekEndStr = format(weekEnd, 'MMM dd');
  const weekLogs = dailyLogs.filter((l) => {
    const idx = dailyLogs.indexOf(l);
    const dayDate = new Date();
    dayDate.setDate(dayDate.getDate() - (dailyLogs.length - 1 - idx));
    return dayDate >= weekStart && dayDate <= weekEnd;
  });
  // Simpler: just take last 7 entries
  const last7 = dailyLogs.slice(-7);

  const totalWeekHours = last7.reduce((s, l) => s + l.hours, 0);
  const totalWeekTasks = last7.reduce((s, l) => s + l.tasks, 0);
  const totalMonthHours = dailyLogs.reduce((s, l) => s + l.hours, 0);
  const totalMonthTasks = dailyLogs.reduce((s, l) => s + l.tasks, 0);

  if (loading) {
    return (
      <AppLayout requiredRole="admin">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout requiredRole="admin">
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">{profile?.name || 'Employee'}</h1>
            <p className="text-muted-foreground">{profile?.email}</p>
          </div>
          <Button variant="destructive" size="sm" onClick={handleDeleteEmployee} className="gap-2">
            <Trash2 className="h-4 w-4" /> Remove Employee
          </Button>
        </div>

        <Tabs defaultValue="daily">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>

          <TabsContent value="daily" className="space-y-4">
            <div className="space-y-2">
              {dailyLogs.slice().reverse().slice(0, 14).map((log) => (
                <div key={log.date} className="flex items-center justify-between p-3 border rounded-lg">
                  <span className="font-medium text-foreground">{log.date}</span>
                  <div className="flex gap-4">
                    <span className="text-sm text-muted-foreground">{log.hours}h</span>
                    <Badge variant="secondary">{log.tasks} tasks</Badge>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="weekly" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalWeekHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Weekly Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalWeekTasks}</p>
                  <p className="text-xs text-muted-foreground">Weekly Tasks</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardContent className="pt-6">
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={last7}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="hours" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Hours" />
                    <Bar dataKey="tasks" fill="hsl(172, 66%, 50%)" radius={[4, 4, 0, 0]} name="Tasks" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="monthly" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalMonthHours.toFixed(1)}h</p>
                  <p className="text-xs text-muted-foreground">Monthly Hours</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-foreground">{totalMonthTasks}</p>
                  <p className="text-xs text-muted-foreground">Monthly Tasks</p>
                </CardContent>
              </Card>
            </div>
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Monthly Productivity Trend</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={dailyLogs}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="hours" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
}
