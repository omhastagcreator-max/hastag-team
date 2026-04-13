import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Activity, Target, CheckCircle2, Circle, Code2, Megaphone, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { ClientProjectProgress } from '@/components/RoleSpecPanels';

interface Project {
  id: string;
  name: string;
  project_type: string;
}

interface MetricConfig {
  metric_name: string;
  better_direction: 'up' | 'down';
}

interface Metric {
  id: string;
  date: string;
  metric_name: string;
  value: number;
}

interface Alert {
  id: string;
  message: string;
}

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  metric_name: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  task_type: string;
  created_at: string;
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [project, setProject] = useState<Project | null>(null);
  const [configs, setConfigs] = useState<Record<string, 'up' | 'down'>>({});
  const [metrics, setMetrics] = useState<Metric[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [updates, setUpdates] = useState<any[]>([]);
  const [unreadAlert, setUnreadAlert] = useState<Alert | null>(null);

  useEffect(() => {
    if (!user) return;
    const fetchClientData = async () => {
      const { data: pData } = await supabase.from('projects').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      if (!pData) return;
      setProject(pData);

      const { data: alertsData } = await supabase.from('client_alerts').select('*').eq('client_id', user.id).eq('is_read', false).limit(1);
      if (alertsData && alertsData.length > 0) {
        setUnreadAlert(alertsData[0]);
      }

      const [cRes, mRes, gRes, tRes, uRes] = await Promise.all([
        supabase.from('metric_config').select('*'),
        supabase.from('metrics').select('*').eq('project_id', pData.id).order('date', { ascending: true }),
        supabase.from('project_goals').select('*').eq('project_id', pData.id),
        supabase.from('project_tasks').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
        // @ts-ignore
        supabase.from('project_updates').select('*, profiles!author_id(name)').eq('project_id', pData.id).order('created_at', { ascending: false })
      ]);

      if (cRes.data) {
        const cMap: Record<string, 'up' | 'down'> = {};
        cRes.data.forEach((c: any) => cMap[c.metric_name] = c.better_direction);
        setConfigs(cMap);
      }
      if (mRes.data) setMetrics(mRes.data);
      if (gRes.data) setGoals(gRes.data);
      if (tRes.data) setTasks(tRes.data);
      if (uRes.data) setUpdates(uRes.data);
    };

    fetchClientData();
  }, [user]);

  const handleApproval = async (updateId: string, isApproved: boolean) => {
    // @ts-ignore
    await supabase.from('project_updates').update({ is_approved: isApproved }).eq('id', updateId);
    setUpdates(updates.map(u => u.id === updateId ? { ...u, is_approved: isApproved } : u));
  };

  const kpiData = useMemo(() => {
    if (!metrics.length) return [];
    
    const byMetric: Record<string, Metric[]> = {};
    metrics.forEach(m => {
      if (!byMetric[m.metric_name]) byMetric[m.metric_name] = [];
      byMetric[m.metric_name].push(m);
    });

    return Object.entries(byMetric).map(([name, mets]) => {
      mets.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      const current = mets[0].value;
      const avg3 = mets.slice(1, 4).reduce((sum, m) => sum + m.value, 0) / Math.max(1, Math.min(3, mets.length - 1));
      
      const dir = configs[name] || 'up';
      const isBetter = dir === 'up' ? current > avg3 : current < avg3;
      const isStable = Math.abs(current - avg3) < (avg3 * 0.05);

      return {
        name,
        current,
        avg3,
        changeProc: avg3 > 0 ? ((current - avg3) / avg3) * 100 : 0,
        status: isStable ? 'stable' : isBetter ? 'good' : 'bad'
      };
    });
  }, [metrics, configs]);

  const chartData = useMemo(() => {
     const byDate: Record<string, any> = {};
     metrics.forEach(m => {
       if (!byDate[m.date]) byDate[m.date] = { date: m.date };
       byDate[m.date][m.metric_name] = m.value;
     });
     return Object.values(byDate).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [metrics]);

  const devTasks = tasks.filter(t => t.task_type === 'dev');
  const completedDev = devTasks.filter(t => t.status === 'done').length;
  const totalDev = devTasks.length;
  const devProgress = totalDev > 0 ? (completedDev / totalDev) * 100 : 0;

  // Calculate Health Score (0-100) based on Goal Targets + Dev Progress
  const healthScore = useMemo(() => {
    let score = devProgress; // Base score on dev progress
    if (goals.length > 0) {
      const avgGoalProgress = goals.reduce((acc, g) => acc + Math.min(100, (g.current_value / g.target_value) * 100), 0) / goals.length;
      score = (score + avgGoalProgress) / 2;
    }
    // If no goals and no dev tasks, it's a new project
    if (goals.length === 0 && totalDev === 0) return 100;
    return Math.round(score);
  }, [devProgress, goals, totalDev]);

  const handleAcknowledgeAlert = async () => {
    if (!unreadAlert) return;
    await supabase.from('client_alerts').update({ is_read: true }).eq('id', unreadAlert.id);
    setUnreadAlert(null);
  };

  return (
    <AppLayout requiredRole="client">
      <PageTransition>
        <div className="max-w-4xl mx-auto space-y-8">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Your Projects</h1>
            {project ? (
              <p className="text-sm text-muted-foreground mt-1">{project.name}</p>
            ) : <p className="text-sm text-muted-foreground mt-1">Loading…</p>}
          </div>

          {!project && (
             <div className="animate-pulse flex flex-col gap-4">
                <Skeleton className="h-32 rounded-xl shadow-sm border border-border/20 w-full" />
                <Skeleton className="h-32 rounded-xl shadow-sm border border-border/20 w-full" />
             </div>
          )}

          <ClientProjectProgress />

          {project && (
             <div className="space-y-6">
                 <div className="text-sm text-muted-foreground mb-2">
                    Review and mark the latest deliverables and updates pushed by your Agency Lead below.
                 </div>
                 
                 <div className="space-y-4">
                    {updates.map(u => (
                      <MotionCard key={u.id} delay={0.1} className="overflow-hidden border border-border/50 shadow-sm relative hover:shadow-md transition-shadow">
                         {u.requires_approval && u.is_approved === null && (
                            <div className="absolute top-0 left-0 w-1 h-full bg-orange-500 animate-pulse"></div>
                         )}
                         {u.is_approved === true && <div className="absolute top-0 left-0 w-1 h-full bg-green-500"></div>}
                         {u.is_approved === false && <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>}

                         <CardContent className="p-6">
                             <div className="flex justify-between items-start">
                               <p className="text-base font-medium flex-1 text-foreground/90">{u.content}</p>
                               {u.requires_approval && u.is_approved !== null && (
                                  <span className={`text-xs ml-4 px-3 py-1.5 rounded-md font-bold uppercase tracking-wider ${u.is_approved ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                    {u.is_approved ? 'Approved' : 'Rejected'}
                                  </span>
                               )}
                             </div>
                             
                             {u.requires_approval && u.is_approved === null && (
                                <div className="mt-6 flex gap-3 max-w-sm">
                                  <button onClick={() => handleApproval(u.id, true)} className="flex-1 bg-green-500 border border-green-600 hover:bg-green-600 text-white text-sm py-2 rounded-md font-semibold transition-colors shadow-sm">👍 Approve</button>
                                  <button onClick={() => handleApproval(u.id, false)} className="flex-1 bg-red-500 border border-red-600 hover:bg-red-600 text-white text-sm py-2 rounded-md font-semibold transition-colors shadow-sm">👎 Reject</button>
                                </div>
                             )}
                             
                             <div className="flex items-center gap-2 mt-4 pt-4 border-t border-border/30">
                                <MessageSquare className="h-4 w-4 text-orange-500" />
                                <span className="text-xs text-muted-foreground font-medium">From {u.profiles?.name || 'System'}</span>
                                <span className="text-muted-foreground/30">•</span>
                                <span className="text-xs text-muted-foreground">{new Date(u.created_at).toLocaleString()}</span>
                             </div>
                         </CardContent>
                      </MotionCard>
                    ))}
                    {updates.length === 0 && (
                       <div className="text-center py-12 border border-dashed rounded-xl border-border/50 text-muted-foreground">
                         No updates have been pushed to your feed yet.
                       </div>
                    )}
                 </div>
             </div>
          )}
        </div>
      </PageTransition>

      {unreadAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
          <MotionCard delay={0} className="w-full max-w-md bg-background border-amber-500/50 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-amber-500" />
            <CardHeader className="text-center pt-8">
              <Megaphone className="h-12 w-12 text-amber-500 mx-auto mb-4 animate-bounce" />
              <CardTitle className="text-2xl text-amber-500">Account Alert</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6 pb-8">
              <p className="text-lg font-medium">{unreadAlert.message}</p>
              <button 
                onClick={handleAcknowledgeAlert} 
                className="w-full bg-amber-500 hover:bg-amber-600 focus:outline-none text-white font-bold rounded-lg py-3 shadow-md transition-colors"
              >
                I Understand
              </button>
            </CardContent>
          </MotionCard>
        </div>
      )}
    </AppLayout>
  );
}
