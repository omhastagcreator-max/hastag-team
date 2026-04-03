import { useEffect, useState, useMemo } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Progress } from "@/components/ui/progress";
import { TrendingUp, TrendingDown, Minus, Activity, Target, CheckCircle2, Circle, Code2, Megaphone } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

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

  useEffect(() => {
    if (!user) return;
    const fetchClientData = async () => {
      const { data: pData } = await supabase.from('projects').select('*').eq('client_id', user.id).order('created_at', { ascending: false }).limit(1).single();
      if (!pData) return;
      setProject(pData);

      const [cRes, mRes, gRes, tRes] = await Promise.all([
        supabase.from('metric_config').select('*'),
        supabase.from('metrics').select('*').eq('project_id', pData.id).order('date', { ascending: true }),
        supabase.from('project_goals').select('*').eq('project_id', pData.id),
        supabase.from('project_tasks').select('*').eq('project_id', pData.id).order('created_at', { ascending: false }),
      ]);

      if (cRes.data) {
        const cMap: Record<string, 'up' | 'down'> = {};
        cRes.data.forEach((c: any) => cMap[c.metric_name] = c.better_direction);
        setConfigs(cMap);
      }
      if (mRes.data) setMetrics(mRes.data);
      if (gRes.data) setGoals(gRes.data);
      if (tRes.data) setTasks(tRes.data);
    };

    fetchClientData();
  }, [user]);

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

  return (
    <AppLayout requiredRole="client">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-8">
          <div className="flex flex-col gap-1 relative z-10 p-6 bg-gradient-to-r from-background to-muted/20 rounded-2xl border border-border/50 shadow-sm backdrop-blur-sm shadow-blue-500/5">
            <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-primary via-blue-500 to-purple-500">Live Client Interface</h1>
            {project ? (
              <p className="text-muted-foreground text-lg uppercase tracking-wide font-semibold mt-2 opacity-80">{project.name} • {project.project_type}</p>
            ) : <p className="text-muted-foreground">Loading your live dashboard...</p>}
          </div>

          {!project && (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground animate-pulse">Initializing data streams...</p>
            </div>
          )}

          {project && (
            <>
              <div className="grid lg:grid-cols-3 gap-6">
                 {/* Website Tech Progress */}
                 {project.project_type !== 'ads' && (
                    <MotionCard delay={0.1} className="lg:col-span-1 border-blue-500/20 bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden">
                       <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Code2 className="w-24 h-24 text-blue-500" />
                       </div>
                       <CardHeader>
                          <CardTitle className="text-blue-500 flex items-center gap-2"><Code2 className="h-5 w-5"/> Website Build Progress</CardTitle>
                       </CardHeader>
                       <CardContent className="space-y-6">
                           <div>
                              <div className="flex justify-between items-end mb-2">
                                <span className="text-3xl font-bold">{Math.round(devProgress)}%</span>
                                <span className="text-sm font-medium text-muted-foreground">{completedDev} of {totalDev} Tech Tasks Done</span>
                              </div>
                              <Progress value={devProgress} className="h-4 bg-muted shadow-inner" />
                           </div>
                           
                           <div className="space-y-2 mt-4 max-h-[140px] overflow-y-auto pr-2">
                              {devTasks.slice(0, 5).map(t => (
                                 <div key={t.id} className="flex items-center gap-2 text-sm justify-between">
                                    <div className="flex items-center gap-2">
                                      {t.status === 'done' ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Circle className="h-4 w-4 text-muted-foreground" />}
                                      <span className={t.status === 'done' ? 'text-muted-foreground line-through' : ''}>{t.title}</span>
                                    </div>
                                    <span className="text-xs text-muted-foreground capitalize">{t.status}</span>
                                 </div>
                              ))}
                              {devTasks.length === 0 && <p className="text-sm text-muted-foreground">No development tasks mapped yet.</p>}
                           </div>
                       </CardContent>
                    </MotionCard>
                 )}

                 {/* Marketing Performance Overview */}
                 {project.project_type !== 'website' && (
                    <MotionCard delay={0.2} className={`${project.project_type === 'combined' ? 'lg:col-span-2' : 'lg:col-span-3'}`}>
                       <CardHeader className="pb-2">
                          <CardTitle className="text-primary flex items-center gap-2"><Megaphone className="h-5 w-5"/> Ads KPI Monitor</CardTitle>
                       </CardHeader>
                       <CardContent>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                            {kpiData.map((kpi, i) => (
                              <div key={kpi.name} className="p-4 rounded-xl border border-border/50 bg-background/40 hover:bg-muted/30 transition-colors relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-10 transition-opacity">
                                    <Activity className="h-12 w-12" />
                                </div>
                                <div className="flex justify-between items-start mb-2">
                                  <p className="text-xs font-semibold text-muted-foreground uppercase">{kpi.name}</p>
                                  {kpi.status === 'good' && <TrendingUp className="text-green-500 h-4 w-4" />}
                                  {kpi.status === 'bad' && <TrendingDown className="text-red-500 h-4 w-4" />}
                                  {kpi.status === 'stable' && <Minus className="text-yellow-500 h-4 w-4" />}
                                </div>
                                <div className="text-2xl font-black">{kpi.current.toLocaleString(undefined, {minimumFractionDigits: 0, maximumFractionDigits: 2})}</div>
                                <div className={`text-[10px] mt-1 font-medium ${kpi.status === 'good' ? 'text-green-500' : kpi.status === 'bad' ? 'text-red-500' : 'text-yellow-500'}`}>
                                  {kpi.changeProc > 0 ? '+' : ''}{kpi.changeProc.toFixed(1)}% vs 3d avg
                                </div>
                              </div>
                            ))}
                            {kpiData.length === 0 && <p className="text-sm text-muted-foreground col-span-full">No active campaign metrics detected.</p>}
                          </div>
                       </CardContent>
                    </MotionCard>
                 )}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                <MotionCard delay={0.4} className="lg:col-span-2 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-primary opacity-90"><Activity className="h-5 w-5"/> Trend Analysis (30 Days)</CardTitle>
                  </CardHeader>
                  <CardContent className="h-[300px]">
                    {chartData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={chartData}>
                          <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                          <XAxis dataKey="date" tick={{fontSize: 10}} opacity={0.5} />
                          <YAxis tick={{fontSize: 10}} opacity={0.5} />
                          <Tooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.85)', color: '#fff', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.5)' }} />
                          {kpiData.map((k, idx) => (
                             <Line key={k.name} type="monotone" dataKey={k.name} stroke={`hsl(${(idx * 60) % 360}, 70%, 50%)`} strokeWidth={3} dot={{r: 2, fill: `hsl(${(idx * 60) % 360}, 70%, 50%)`}} activeDot={{r: 6}} />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    ) : <p className="text-muted-foreground text-sm flex h-full items-center justify-center border border-dashed rounded-lg">Awaiting data aggregation...</p>}
                  </CardContent>
                </MotionCard>

                <div className="space-y-6">
                   <MotionCard delay={0.5} className="shadow-sm">
                     <CardHeader>
                       <CardTitle className="text-lg flex items-center gap-2"><Target className="h-5 w-5 text-purple-500"/> Campaign Goals</CardTitle>
                     </CardHeader>
                     <CardContent className="space-y-5">
                       {goals.length > 0 ? goals.map(g => (
                         <div key={g.id} className="space-y-1.5">
                           <div className="flex justify-between text-sm">
                             <span className="font-semibold">{g.title}</span>
                             <span className="text-xs text-muted-foreground">{g.current_value} / {g.target_value}</span>
                           </div>
                           <Progress value={Math.min(100, (g.current_value / g.target_value) * 100)} className="h-2.5 shadow-inner" />
                         </div>
                       )) : <p className="text-muted-foreground text-sm border border-dashed rounded-lg p-4 text-center">No strategic goals defined.</p>}
                     </CardContent>
                   </MotionCard>
                </div>
              </div>
            </>
          )}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
