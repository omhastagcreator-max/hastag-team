/**
 * Spec-driven dashboard panels (DEVELOPER_HANDOFF.md / Role System v2).
 *
 * These widgets back the four dashboards with the data each role
 * actually needs to see:
 *
 *   <OverdueTasksAdmin />     -> §1.1  global overdue feed
 *   <AtRiskProjects />        -> §1.2  >30% overdue tasks per project
 *   <CompanyMetricsCards />   -> §1.4  total / done / pending / overdue / sessions
 *   <ClientOverviewGrid />    -> §1.5  client + active projects + LTV + progress
 *
 *   <EmployeeTaskBuckets />   -> §2    today / overdue / upcoming for the
 *                                       currently signed-in employee
 *
 *   <ClientProjectProgress /> -> §4    active projects + status badges
 *
 * Everything reads from `project_tasks.due_date`. The
 * 20260411_role_system_v2.sql migration adds the column and backfills
 * sensible values for existing rows so the panels are not empty.
 */

import { useEffect, useMemo, useState } from 'react';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MotionCard } from '@/components/ui/MotionCard';
import { Progress } from '@/components/ui/progress';
import {
  AlertTriangle,
  AlarmClock,
  CalendarClock,
  ListTodo,
  CheckCircle2,
  Activity,
  Building2,
  Briefcase,
  TrendingUp,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { format, isPast, isToday, addDays } from 'date-fns';

// ---------------------------------------------------------------------
// Shared types
// ---------------------------------------------------------------------

interface TaskRow {
  id: string;
  title: string;
  status: string;
  due_date: string | null;
  assigned_to: string | null;
  project_id: string | null;
}

interface ProfileLite {
  user_id: string;
  name: string;
  email: string;
}

interface ProjectLite {
  id: string;
  name: string;
  client_id: string | null;
  deal_id: string | null;
  project_type: string;
}

// ---------------------------------------------------------------------
// 1. ADMIN PANELS
// ---------------------------------------------------------------------

export function CompanyMetricsCards() {
  const [stats, setStats] = useState({
    total: 0,
    done: 0,
    pending: 0,
    overdue: 0,
    activeSessions: 0,
  });

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const [tasksRes, sessionsRes] = await Promise.all([
        supabase.from('project_tasks').select('id, status, due_date'),
        supabase.from('sessions').select('id').is('end_time', null),
      ]);
      const tasks = (tasksRes.data || []) as Pick<TaskRow, 'status' | 'due_date'>[];
      setStats({
        total: tasks.length,
        done: tasks.filter((t) => t.status === 'done').length,
        pending: tasks.filter((t) => t.status !== 'done').length,
        overdue: tasks.filter(
          (t) => t.status !== 'done' && t.due_date && t.due_date < nowIso,
        ).length,
        activeSessions: (sessionsRes.data || []).length,
      });
    };
    load();
  }, []);

  const items = [
    { label: 'Total Tasks', value: stats.total, icon: ListTodo, color: 'text-primary' },
    { label: 'Completed', value: stats.done, icon: CheckCircle2, color: 'text-green-500' },
    { label: 'Pending', value: stats.pending, icon: AlarmClock, color: 'text-amber-500' },
    { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-500' },
    { label: 'Active Sessions', value: stats.activeSessions, icon: Activity, color: 'text-purple-500' },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      {items.map((item, i) => (
        <MotionCard key={item.label} delay={0.05 * i}>
          <CardContent className="p-4 text-center">
            <item.icon className={`h-6 w-6 mx-auto mb-2 ${item.color}`} />
            <p className="text-2xl font-bold text-foreground">{item.value}</p>
            <p className="text-xs text-muted-foreground">{item.label}</p>
          </CardContent>
        </MotionCard>
      ))}
    </div>
  );
}

export function OverdueTasksAdmin() {
  const [tasks, setTasks] = useState<(TaskRow & { assignee?: string })[]>([]);

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const { data } = await supabase
        .from('project_tasks')
        .select('id, title, status, due_date, assigned_to, project_id')
        .neq('status', 'done')
        .lt('due_date', nowIso)
        .order('due_date', { ascending: true })
        .limit(20);
      const rows = (data || []) as TaskRow[];

      const ids = Array.from(new Set(rows.map((r) => r.assigned_to).filter(Boolean))) as string[];
      let nameMap: Record<string, string> = {};
      if (ids.length) {
        const { data: profs } = await supabase
          .from('profiles')
          .select('user_id, name, email')
          .in('user_id', ids);
        (profs || []).forEach((p) => {
          nameMap[p.user_id] = p.name || p.email;
        });
      }

      setTasks(
        rows.map((r) => ({
          ...r,
          assignee: r.assigned_to ? nameMap[r.assigned_to] : undefined,
        })),
      );
    };
    load();
  }, []);

  return (
    <MotionCard delay={0.1} className="border-red-500/40 shadow-sm">
      <CardHeader className="border-b border-red-500/20 bg-red-500/5">
        <CardTitle className="text-lg flex items-center gap-2 text-red-600 dark:text-red-400">
          <AlertTriangle className="h-5 w-5" />
          Overdue Tasks (Global)
          <Badge variant="destructive" className="ml-2">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 max-h-72 overflow-auto">
        {tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No overdue tasks. Nice.</p>
        ) : (
          <div className="divide-y divide-border/50">
            {tasks.map((t) => (
              <div key={t.id} className="p-3 flex items-center justify-between">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.assignee || 'Unassigned'} ·{' '}
                    {t.due_date ? format(new Date(t.due_date), 'MMM dd') : 'no date'}
                  </p>
                </div>
                <Badge variant="destructive" className="shrink-0">{t.status}</Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}

export function AtRiskProjects() {
  const [risk, setRisk] = useState<{ id: string; name: string; overduePct: number; total: number; overdue: number }[]>([]);

  useEffect(() => {
    const load = async () => {
      const nowIso = new Date().toISOString();
      const [projRes, taskRes] = await Promise.all([
        supabase.from('projects').select('id, name'),
        supabase.from('project_tasks').select('id, status, due_date, project_id'),
      ]);
      const projects = (projRes.data || []) as { id: string; name: string }[];
      const tasks = (taskRes.data || []) as TaskRow[];

      const computed = projects
        .map((p) => {
          const projTasks = tasks.filter((t) => t.project_id === p.id);
          const overdue = projTasks.filter(
            (t) => t.status !== 'done' && t.due_date && t.due_date < nowIso,
          ).length;
          const overduePct = projTasks.length ? (overdue / projTasks.length) * 100 : 0;
          return { id: p.id, name: p.name, overdue, total: projTasks.length, overduePct };
        })
        .filter((p) => p.overduePct > 30 && p.total > 0)
        .sort((a, b) => b.overduePct - a.overduePct);

      setRisk(computed);
    };
    load();
  }, []);

  return (
    <MotionCard delay={0.15} className="border-amber-500/40">
      <CardHeader className="border-b border-amber-500/20 bg-amber-500/5">
        <CardTitle className="text-lg flex items-center gap-2 text-amber-600 dark:text-amber-400">
          <AlarmClock className="h-5 w-5" />
          At-Risk Projects
          <Badge className="ml-2 bg-amber-500 text-white">{risk.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 space-y-3 max-h-72 overflow-auto">
        {risk.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">All projects are healthy.</p>
        ) : (
          risk.map((r) => (
            <div key={r.id} className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium truncate">{r.name}</span>
                <span className="text-amber-500 font-semibold">{r.overduePct.toFixed(0)}% overdue</span>
              </div>
              <Progress value={r.overduePct} className="h-1.5" />
              <p className="text-xs text-muted-foreground">{r.overdue} of {r.total} tasks past due</p>
            </div>
          ))
        )}
      </CardContent>
    </MotionCard>
  );
}

export function ClientOverviewGrid() {
  const [clients, setClients] = useState<{
    user_id: string;
    name: string;
    email: string;
    projects: { id: string; name: string; progress: number }[];
    dealValue: number;
  }[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: roles } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
      const ids = (roles || []).map((r) => r.user_id);
      if (!ids.length) return;

      const [profilesRes, projectsRes, tasksRes, dealsRes] = await Promise.all([
        supabase.from('profiles').select('user_id, name, email').in('user_id', ids),
        supabase.from('projects').select('id, name, client_id, deal_id').in('client_id', ids),
        supabase.from('project_tasks').select('id, status, project_id'),
        supabase.from('deals').select('id, deal_value'),
      ]);

      const profiles = (profilesRes.data || []) as ProfileLite[];
      const projects = (projectsRes.data || []) as ProjectLite[];
      const tasks = (tasksRes.data || []) as Pick<TaskRow, 'status' | 'project_id'>[];
      const deals = (dealsRes.data || []) as { id: string; deal_value: number }[];

      const merged = profiles.map((prof) => {
        const myProjects = projects.filter((p) => p.client_id === prof.user_id);
        const dealValue = myProjects.reduce((sum, p) => {
          if (!p.deal_id) return sum;
          const d = deals.find((x) => x.id === p.deal_id);
          return sum + (d ? Number(d.deal_value) : 0);
        }, 0);
        const projectsWithProgress = myProjects.map((p) => {
          const my = tasks.filter((t) => t.project_id === p.id);
          const done = my.filter((t) => t.status === 'done').length;
          const progress = my.length ? Math.round((done / my.length) * 100) : 0;
          return { id: p.id, name: p.name, progress };
        });
        return {
          user_id: prof.user_id,
          name: prof.name || prof.email,
          email: prof.email,
          projects: projectsWithProgress,
          dealValue,
        };
      });
      setClients(merged);
    };
    load();
  }, []);

  return (
    <MotionCard delay={0.2}>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" /> Client Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {clients.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">No clients yet.</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {clients.map((c) => {
              const overall = c.projects.length
                ? Math.round(c.projects.reduce((s, p) => s + p.progress, 0) / c.projects.length)
                : 0;
              return (
                <div key={c.user_id} className="border border-border/50 rounded-lg p-4 bg-muted/20">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold">{c.name}</p>
                      <p className="text-xs text-muted-foreground">{c.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-green-500">₹{c.dealValue.toLocaleString()}</p>
                      <p className="text-[10px] text-muted-foreground uppercase">LTV</p>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">{c.projects.length} active project{c.projects.length === 1 ? '' : 's'}</span>
                      <span className="font-semibold">{overall}%</span>
                    </div>
                    <Progress value={overall} className="h-1.5" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </MotionCard>
  );
}

// ---------------------------------------------------------------------
// 2. EMPLOYEE PANEL
// ---------------------------------------------------------------------

export function EmployeeTaskBuckets() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from('project_tasks')
        .select('id, title, status, due_date, assigned_to, project_id')
        .eq('assigned_to', user.id)
        .neq('status', 'done')
        .order('due_date', { ascending: true });
      setTasks((data || []) as TaskRow[]);
      setLoading(false);
    };
    load();
  }, [user]);

  const buckets = useMemo(() => {
    const now = new Date();
    const upcomingCutoff = addDays(now, 7);
    const overdue: TaskRow[] = [];
    const today: TaskRow[] = [];
    const upcoming: TaskRow[] = [];
    tasks.forEach((t) => {
      if (!t.due_date) {
        upcoming.push(t);
        return;
      }
      const d = new Date(t.due_date);
      if (isPast(d) && !isToday(d)) overdue.push(t);
      else if (isToday(d)) today.push(t);
      else if (d <= upcomingCutoff) upcoming.push(t);
    });
    return { overdue, today, upcoming };
  }, [tasks]);

  if (loading) {
    return <p className="text-sm text-muted-foreground">Loading your tasks…</p>;
  }

  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Bucket
        title="Overdue"
        icon={<AlertTriangle className="h-4 w-4" />}
        tasks={buckets.overdue}
        tone="danger"
        emptyText="Nothing past due 🎉"
      />
      <Bucket
        title="Today"
        icon={<AlarmClock className="h-4 w-4" />}
        tasks={buckets.today}
        tone="primary"
        emptyText="Nothing due today"
      />
      <Bucket
        title="Upcoming (7d)"
        icon={<CalendarClock className="h-4 w-4" />}
        tasks={buckets.upcoming}
        tone="muted"
        emptyText="Inbox zero ahead"
      />
    </div>
  );
}

function Bucket({
  title,
  icon,
  tasks,
  tone,
  emptyText,
}: {
  title: string;
  icon: React.ReactNode;
  tasks: TaskRow[];
  tone: 'danger' | 'primary' | 'muted';
  emptyText: string;
}) {
  const toneStyles =
    tone === 'danger'
      ? 'border-red-500/50 bg-red-500/5 text-red-600 dark:text-red-400'
      : tone === 'primary'
      ? 'border-primary/50 bg-primary/5 text-primary'
      : 'border-border/50 bg-muted/30 text-muted-foreground';

  return (
    <MotionCard delay={0.1} className={`border ${toneStyles.split(' ').slice(0, 2).join(' ')}`}>
      <CardHeader className="pb-2">
        <CardTitle className={`text-sm flex items-center gap-2 ${toneStyles.split(' ').slice(2).join(' ')}`}>
          {icon}
          {title}
          <Badge variant="secondary" className="ml-1">{tasks.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-3 max-h-60 overflow-auto space-y-2">
        {tasks.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-4">{emptyText}</p>
        ) : (
          tasks.map((t) => (
            <div
              key={t.id}
              className="text-sm p-2 rounded border border-border/40 bg-background/50"
            >
              <p className="font-medium truncate">{t.title}</p>
              {t.due_date && (
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  due {format(new Date(t.due_date), 'MMM dd, HH:mm')}
                </p>
              )}
            </div>
          ))
        )}
      </CardContent>
    </MotionCard>
  );
}

// ---------------------------------------------------------------------
// 3. CLIENT PANEL
// ---------------------------------------------------------------------

export function ClientProjectProgress() {
  const { user } = useAuth();
  const [rows, setRows] = useState<{
    id: string;
    name: string;
    progress: number;
    total: number;
    done: number;
    overdue: number;
    health: 'healthy' | 'at_risk' | 'delayed';
  }[]>([]);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('client_id', user.id);

      const ids = (projects || []).map((p) => p.id);
      if (!ids.length) {
        setRows([]);
        return;
      }
      const { data: tasks } = await supabase
        .from('project_tasks')
        .select('id, status, due_date, project_id')
        .in('project_id', ids);

      const nowIso = new Date().toISOString();
      const computed = (projects || []).map((p) => {
        const my = (tasks || []).filter((t) => t.project_id === p.id);
        const done = my.filter((t) => t.status === 'done').length;
        const overdue = my.filter(
          (t) => t.status !== 'done' && t.due_date && t.due_date < nowIso,
        ).length;
        const progress = my.length ? Math.round((done / my.length) * 100) : 0;
        const overduePct = my.length ? (overdue / my.length) * 100 : 0;
        const health: 'healthy' | 'at_risk' | 'delayed' =
          overduePct > 50 ? 'delayed' : overduePct > 20 ? 'at_risk' : 'healthy';
        return { id: p.id, name: p.name, progress, total: my.length, done, overdue, health };
      });
      setRows(computed);
    };
    load();
  }, [user]);

  if (rows.length === 0) {
    return (
      <div className="text-center py-12 border border-dashed rounded-xl border-border/50 text-muted-foreground">
        No active projects yet.
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {rows.map((r) => {
        const tone =
          r.health === 'healthy'
            ? 'border-green-500/40 bg-green-500/5'
            : r.health === 'at_risk'
            ? 'border-amber-500/40 bg-amber-500/5'
            : 'border-red-500/40 bg-red-500/5';
        const label =
          r.health === 'healthy' ? 'Healthy' : r.health === 'at_risk' ? 'At Risk' : 'Delayed';
        const labelTone =
          r.health === 'healthy'
            ? 'bg-green-500/20 text-green-600'
            : r.health === 'at_risk'
            ? 'bg-amber-500/20 text-amber-600'
            : 'bg-red-500/20 text-red-600';

        return (
          <MotionCard key={r.id} delay={0.1} className={`border ${tone}`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-primary" /> {r.name}
                </CardTitle>
                <span className={`text-[10px] uppercase tracking-wider px-2 py-1 rounded font-bold ${labelTone}`}>
                  {label}
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">{r.done} of {r.total} tasks done</span>
                  <span className="font-semibold flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" /> {r.progress}%
                  </span>
                </div>
                <Progress value={r.progress} className="h-2" />
              </div>
              {r.overdue > 0 && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> {r.overdue} task{r.overdue === 1 ? '' : 's'} past due
                </p>
              )}
            </CardContent>
          </MotionCard>
        );
      })}
    </div>
  );
}
