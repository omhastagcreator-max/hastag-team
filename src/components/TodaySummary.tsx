import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, CheckCircle2, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function TodaySummary() {
  const { user } = useAuth();
  const [hoursWorked, setHoursWorked] = useState(0);
  const [taskCount, setTaskCount] = useState(0);
  const [doneTasks, setDoneTasks] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayIso = today.toISOString();

    const fetchSummary = async () => {
      const [sessionsRes, tasksRes] = await Promise.all([
        supabase.from('sessions').select('start_time, end_time, break_time').eq('user_id', user.id).gte('start_time', todayIso),
        supabase.from('project_tasks').select('status').eq('assigned_to', user.id).gte('created_at', todayIso),
      ]);

      let totalMinutes = 0;
      (sessionsRes.data || []).forEach((s) => {
        const end = s.end_time ? new Date(s.end_time).getTime() : Date.now();
        const start = new Date(s.start_time).getTime();
        totalMinutes += (end - start) / 60000 - (s.break_time || 0);
      });
      setHoursWorked(Math.max(0, totalMinutes / 60));

      const allTasks = tasksRes.data || [];
      setTaskCount(allTasks.length);
      setDoneTasks(allTasks.filter((t) => t.status === 'done').length);
    };

    fetchSummary();
    const interval = setInterval(fetchSummary, 30000);
    return () => clearInterval(interval);
  }, [user]);

  const stats = [
    { label: 'Hours Worked', value: hoursWorked.toFixed(1) + 'h', icon: Clock, color: 'text-primary' },
    { label: 'Tasks Added', value: taskCount.toString(), icon: Timer, color: 'text-accent' },
    { label: 'Completed', value: doneTasks.toString(), icon: CheckCircle2, color: 'text-primary' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <CardContent className="p-4 text-center">
            <stat.icon className={`h-6 w-6 mx-auto mb-2 ${stat.color}`} />
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-xs text-muted-foreground">{stat.label}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
