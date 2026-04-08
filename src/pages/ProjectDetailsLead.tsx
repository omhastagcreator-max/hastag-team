import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ArrowLeft, Target, ListTodo, TrendingUp, CheckCircle2, Circle, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Project {
  id: string;
  name: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  task_type: string;
  assigned_to: string | null;
  profiles?: { name: string };
}

interface Goal {
  id: string;
  title: string;
  target_value: number;
  current_value: number;
  metric_name: string;
}

export default function ProjectDetailsLead() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [metricConfigs, setMetricConfigs] = useState<{metric_name: string}[]>([]);
  const [members, setMembers] = useState<{user_id: string, name: string}[]>([]);
  const [availableEmployees, setAvailableEmployees] = useState<{user_id: string, name: string}[]>([]);
  
  // Forms
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskType, setNewTaskType] = useState('dev');
  const [newTaskAssignee, setNewTaskAssignee] = useState('unassigned');
  
  const [newMemberId, setNewMemberId] = useState('');

  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalTarget, setNewGoalTarget] = useState('');
  const [newGoalMetric, setNewGoalMetric] = useState('');
  
  const [metricValue, setMetricValue] = useState('');
  const [metricName, setMetricName] = useState('');

  // Mock Updates for MVP
  const [newUpdate, setNewUpdate] = useState('');
  const [updates, setUpdates] = useState([
    { id: '1', date: '2 hours ago', text: 'Completed initial audit phase for primary pages.' },
    { id: '2', date: 'Yesterday', text: 'Client kickoff successful. Access to ad accounts verified.' }
  ]);

  const fetchData = async () => {
    if (!projectId) return;
    
    const { data: projData } = await supabase.from('projects').select('*').eq('id', projectId).single();
    if (projData) setProject(projData);

    const { data: tasksData } = await supabase.from('project_tasks').select('*, profiles!project_tasks_assigned_to_fkey(name)').eq('project_id', projectId).order('created_at');
    if (tasksData) setTasks(tasksData as any);

    const { data: goalsData } = await supabase.from('project_goals').select('*').eq('project_id', projectId).order('created_at');
    if (goalsData) setGoals(goalsData);

    const { data: configData } = await supabase.from('metric_config').select('metric_name');
    if (configData) setMetricConfigs(configData);
    if (!newGoalMetric && configData && configData.length > 0) setNewGoalMetric(configData[0].metric_name);
    if (!metricName && configData && configData.length > 0) setMetricName(configData[0].metric_name);

    // Fetch members
    const { data: memData } = await supabase.from('project_members').select('user_id, profiles!inner(name)').eq('project_id', projectId);
    if (memData) setMembers(memData.map((m: any) => ({ user_id: m.user_id, name: m.profiles.name })));

    // Fetch available employees
    const { data: rolesData } = await supabase.from('user_roles').select('user_id').eq('role', 'employee');
    if (rolesData) {
       const empIds = rolesData.map(r => r.user_id);
       const { data: empProfs } = await supabase.from('profiles').select('user_id, name').in('user_id', empIds);
       if (empProfs) setAvailableEmployees(empProfs);
    }
  };

  useEffect(() => {
    fetchData();
  }, [projectId]);

  const addMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemberId || !projectId) return;

    await supabase.from('project_members').insert({ project_id: projectId, user_id: newMemberId, role_in_project: 'member' });
    toast.success('Member assigned to project');
    setNewMemberId('');
    fetchData();
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle || !projectId) return;
    
    await supabase.from('project_tasks').insert({
      project_id: projectId,
      title: newTaskTitle,
      assigned_by: user?.id,
      assigned_to: newTaskAssignee !== 'unassigned' ? newTaskAssignee : null,
      task_type: newTaskType,
      status: 'pending'
    });
    setNewTaskTitle('');
    setNewTaskAssignee('unassigned');
    fetchData();
    toast.success('Task added');
  };

  const toggleTaskStatus = async (task: Task) => {
    const nextStatus = task.status === 'pending' ? 'ongoing' : task.status === 'ongoing' ? 'done' : 'pending';
    await supabase.from('project_tasks').update({ status: nextStatus }).eq('id', task.id);
    fetchData();
  };

  const addGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGoalTitle || !newGoalTarget || !projectId) return;
    
    await supabase.from('project_goals').insert({
      project_id: projectId,
      title: newGoalTitle,
      target_value: Number(newGoalTarget),
      metric_name: newGoalMetric
    });
    setNewGoalTitle('');
    setNewGoalTarget('');
    fetchData();
    toast.success('Goal added');
  };

  const addMetric = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!metricValue || !projectId) return;

    const { error } = await supabase.from('metrics').insert({
      project_id: projectId,
      date: new Date().toISOString().split('T')[0],
      metric_name: metricName,
      value: Number(metricValue)
    });

    if (error) toast.error('Failed to update metric or already updated today');
    else toast.success('Daily metric updated');
    setMetricValue('');
  };

  const addUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUpdate.trim()) return;
    setUpdates([{ id: Date.now().toString(), date: 'Just now', text: newUpdate }, ...updates]);
    setNewUpdate('');
    toast.success('Project update posted');
  };

  if (!project) return null;

  return (
    <AppLayout requiredRole="employee">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}><ArrowLeft /></Button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm">
              {project.name}
            </h1>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Project Members Section */}
            <MotionCard delay={0.05} className="md:col-span-2 border border-border/50 bg-background/50 backdrop-blur">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <Users className="h-5 w-5 text-blue-500" />
                <CardTitle>Project Team</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-6 items-start">
                   <div className="flex-1 flex flex-wrap gap-2">
                     {members.map(m => (
                       <span key={m.user_id} className="bg-blue-500/10 text-blue-500 border border-blue-500/20 px-3 py-1 rounded-full text-sm font-medium">
                         {m.name}
                       </span>
                     ))}
                     {members.length === 0 && <span className="text-muted-foreground text-sm py-1">No members added yet.</span>}
                   </div>
                   <form onSubmit={addMember} className="flex gap-2 w-72">
                      <Select value={newMemberId} onValueChange={setNewMemberId}>
                         <SelectTrigger><SelectValue placeholder="Add member" /></SelectTrigger>
                         <SelectContent>
                            {availableEmployees.filter(e => !members.find(m => m.user_id === e.user_id)).map(e => (
                               <SelectItem key={e.user_id} value={e.user_id}>{e.name}</SelectItem>
                            ))}
                         </SelectContent>
                      </Select>
                      <Button type="submit" variant="secondary">Add</Button>
                   </form>
                </div>
              </CardContent>
            </MotionCard>

            <MotionCard delay={0.1}>
              <CardHeader className="flex flex-row items-center gap-2">
                <ListTodo className="h-5 w-5 text-primary" />
                <CardTitle>Project Tasks</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={addTask} className="space-y-2">
                  <Input value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)} placeholder="New task title..." required />
                  <div className="flex gap-2">
                     <Select value={newTaskAssignee} onValueChange={setNewTaskAssignee}>
                       <SelectTrigger className="w-[140px]"><SelectValue placeholder="Assignee" /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {members.map(m => <SelectItem key={m.user_id} value={m.user_id}>{m.name}</SelectItem>)}
                       </SelectContent>
                     </Select>
                     <Select value={newTaskType} onValueChange={setNewTaskType}>
                       <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
                       <SelectContent>
                          <SelectItem value="dev">Dev</SelectItem>
                          <SelectItem value="ads">Ads</SelectItem>
                          <SelectItem value="content">Content</SelectItem>
                       </SelectContent>
                     </Select>
                     <Button type="submit" className="flex-1">Add</Button>
                  </div>
                </form>
                <div className="space-y-2 max-h-60 overflow-auto">
                  {tasks.map(t => (
                    <div key={t.id} onClick={() => toggleTaskStatus(t)} className="flex items-center justify-between p-3 border border-border/50 rounded-md cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {t.status === 'done' ? <CheckCircle2 className="h-5 w-5 text-green-500" /> : <Circle className="h-5 w-5 text-muted-foreground" />}
                        <div className="flex flex-col">
                           <span className={t.status === 'done' ? 'line-through text-muted-foreground' : 'font-medium'}>{t.title}</span>
                           <span className="text-xs text-muted-foreground">
                             {t.task_type.toUpperCase()} • {t.profiles?.name || 'Unassigned'}
                           </span>
                        </div>
                      </div>
                      <span className="text-xs bg-muted px-2 py-1 rounded capitalize">{t.status}</span>
                    </div>
                  ))}
                  {tasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks yet.</p>}
                </div>
              </CardContent>
            </MotionCard>

            <MotionCard delay={0.2}>
              <CardHeader className="flex flex-row items-center gap-2">
                <Target className="h-5 w-5 text-purple-500" />
                <CardTitle>Project Goals</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={addGoal} className="space-y-2">
                  <Input value={newGoalTitle} onChange={e => setNewGoalTitle(e.target.value)} placeholder="Goal title (e.g. Generate 200 Leads)" required />
                  <div className="flex gap-2">
                    <Select value={newGoalMetric} onValueChange={setNewGoalMetric}>
                      <SelectTrigger className="w-1/2"><SelectValue /></SelectTrigger>
                      <SelectContent>{metricConfigs.map(m => <SelectItem key={m.metric_name} value={m.metric_name}>{m.metric_name}</SelectItem>)}</SelectContent>
                    </Select>
                    <Input type="number" value={newGoalTarget} onChange={e => setNewGoalTarget(e.target.value)} placeholder="Target Value" required className="w-1/2" />
                  </div>
                  <Button type="submit" className="w-full">Create Goal</Button>
                </form>
                <div className="space-y-2 pt-2 max-h-60 overflow-auto">
                  {goals.map(g => (
                    <div key={g.id} className="p-3 border border-border/50 rounded-md bg-muted/20">
                      <div className="font-medium text-sm">{g.title}</div>
                      <div className="text-xs text-muted-foreground mt-1">Current: {g.current_value} / Target: {g.target_value} {g.metric_name}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </MotionCard>
            <MotionCard delay={0.25} className="md:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2 pb-2">
                <MessageSquare className="h-5 w-5 text-orange-500" />
                <CardTitle>Project Updates (Brand Feed)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={addUpdate} className="flex gap-2">
                   <Input value={newUpdate} onChange={e => setNewUpdate(e.target.value)} placeholder="Type an update for the brand owner..." required />
                   <Button type="submit">Post Update</Button>
                </form>
                <div className="space-y-2 mt-4 max-h-40 overflow-auto">
                   {updates.map(u => (
                     <div key={u.id} className="p-3 border border-border/50 rounded-md bg-muted/10">
                        <p className="text-sm">{u.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">{u.date}</p>
                     </div>
                   ))}
                </div>
              </CardContent>
            </MotionCard>
            
            <MotionCard delay={0.3} className="md:col-span-2">
              <CardHeader className="flex flex-row items-center gap-2">
                <TrendingUp className="h-5 w-5 text-accent" />
                <CardTitle>Update Daily Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={addMetric} className="flex gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Metric</label>
                    <Select value={metricName} onValueChange={setMetricName}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{metricConfigs.map(m => <SelectItem key={m.metric_name} value={m.metric_name}>{m.metric_name}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Value for Today</label>
                    <Input type="number" step="0.01" value={metricValue} onChange={e => setMetricValue(e.target.value)} placeholder="0.00" required />
                  </div>
                  <Button type="submit" className="w-32">Save</Button>
                </form>
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
