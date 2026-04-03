import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { format, eachDayOfInterval, startOfMonth, subDays } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, LineChart, Line } from 'recharts';

interface DaySummary {
  date: string;
  totalHours: number;
  totalTasks: number;
}

export default function AdminReports() {
  const [data, setData] = useState<DaySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReports = async () => {
      const start = startOfMonth(new Date());
      const end = new Date();

      const [sessionsRes, tasksRes] = await Promise.all([
        supabase.from('sessions').select('start_time, end_time, break_time').gte('start_time', start.toISOString()),
        supabase.from('tasks').select('created_at').gte('created_at', start.toISOString()),
      ]);

      const days = eachDayOfInterval({ start, end });
      const summaries: DaySummary[] = days.map((day) => {
        const dayStr = format(day, 'yyyy-MM-dd');
        const daySessions = (sessionsRes.data || []).filter(
          (s) => format(new Date(s.start_time), 'yyyy-MM-dd') === dayStr
        );
        let totalMin = 0;
        daySessions.forEach((s) => {
          const endTime = s.end_time ? new Date(s.end_time).getTime() : Date.now();
          totalMin += (endTime - new Date(s.start_time).getTime()) / 60000 - (s.break_time || 0);
        });
        const dayTasks = (tasksRes.data || []).filter(
          (t) => format(new Date(t.created_at), 'yyyy-MM-dd') === dayStr
        );
        return { date: format(day, 'MMM dd'), totalHours: Math.max(0, +(totalMin / 60).toFixed(1)), totalTasks: dayTasks.length };
      });

      setData(summaries);
      setLoading(false);
    };
    fetchReports();
  }, []);

  const last7 = data.slice(-7);
  const weekHours = last7.reduce((s, d) => s + d.totalHours, 0);
  const weekTasks = last7.reduce((s, d) => s + d.totalTasks, 0);
  const monthHours = data.reduce((s, d) => s + d.totalHours, 0);
  const monthTasks = data.reduce((s, d) => s + d.totalTasks, 0);

  return (
    <AppLayout requiredRole="admin">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-foreground">Reports</h1>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{weekHours.toFixed(1)}h</p><p className="text-xs text-muted-foreground">Week Hours</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{weekTasks}</p><p className="text-xs text-muted-foreground">Week Tasks</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{monthHours.toFixed(1)}h</p><p className="text-xs text-muted-foreground">Month Hours</p></CardContent></Card>
              <Card><CardContent className="p-4 text-center"><p className="text-2xl font-bold text-foreground">{monthTasks}</p><p className="text-xs text-muted-foreground">Month Tasks</p></CardContent></Card>
            </div>

            <Card>
              <CardHeader><CardTitle className="text-lg">Weekly Hours (Last 7 Days)</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={last7}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Bar dataKey="totalHours" fill="hsl(199, 89%, 48%)" radius={[4, 4, 0, 0]} name="Hours" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle className="text-lg">Monthly Productivity Trend</CardTitle></CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip />
                    <Line type="monotone" dataKey="totalHours" stroke="hsl(199, 89%, 48%)" strokeWidth={2} name="Hours" />
                    <Line type="monotone" dataKey="totalTasks" stroke="hsl(172, 66%, 50%)" strokeWidth={2} name="Tasks" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </>
        )}
      </div>
    </AppLayout>
  );
}
