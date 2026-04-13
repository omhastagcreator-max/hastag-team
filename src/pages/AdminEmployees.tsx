import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UserPlus, Users, ChevronRight, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface EmployeeSummary {
  user_id: string;
  name: string;
  email: string;
  todayHours: number;
  todayTasks: number;
  lastActive: string | null;
}

export default function AdminEmployees() {
  const [showForm, setShowForm] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<'employee' | 'admin' | 'client'>('employee');
  const [team, setTeam] = useState<'marketing' | 'web_dev' | 'content' | 'sales'>('web_dev');
  const [creating, setCreating] = useState(false);
  
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
      const { data: tasks } = await supabase.from('project_tasks').select('assigned_to, created_at').gte('created_at', todayIso);

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

      setEmployees(summaries.sort((a,b) => b.todayHours - a.todayHours));
      setLoading(false);
    };

    fetchEmployees();
  }, []);

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    
    // Note: In a true production app, creating users from the client UI 
    // without a service role key will log out the admin. 
    // This maintains the existing demo architecture flow.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    if (error) {
      toast.error(error.message);
    } else if (data.user) {
      await supabase.from('profiles').update({ name, team: role === 'client' ? null : team }).eq('user_id', data.user.id);
      
      // Override default 'employee' role trigger
      if (role !== 'employee') {
        setTimeout(async () => {
           await supabase.from('user_roles').update({ role }).eq('user_id', data.user?.id);
        }, 500); // Small delay to let trigger finish
      }

      toast.success(`${role} ${email} created successfully!`);
      setEmail('');
      setPassword('');
      setName('');
      setShowForm(false);
    }
    setCreating(false);
  };

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm flex items-center gap-2">
              <Users className="h-8 w-8 text-primary" />
              Manage Users
            </h1>
            <Button onClick={() => setShowForm(!showForm)} className="gap-2 shadow-sm">
              <UserPlus className="h-4 w-4" /> Create User
            </Button>
          </div>

          {showForm && (
            <MotionCard delay={0.1}>
              <CardHeader>
                <CardTitle className="text-lg">New User Account</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={createUser} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Full Name</label>
                      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                    </div>
                    <div className="space-y-2 flex gap-2">
                       <div className="w-1/2 space-y-2">
                          <label className="text-sm font-medium text-foreground">Role</label>
                          <Select value={role} onValueChange={(v: any) => setRole(v)}>
                            <SelectTrigger><SelectValue /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="employee">Employee</SelectItem>
                              <SelectItem value="admin">Admin (Master)</SelectItem>
                              <SelectItem value="client">Client</SelectItem>
                              <SelectItem value="sales">Sales Team</SelectItem>
                            </SelectContent>
                          </Select>
                       </div>
                       {role !== 'client' && (
                         <div className="w-1/2 space-y-2">
                            <label className="text-sm font-medium text-foreground">Team</label>
                            <Select value={team} onValueChange={(v: any) => setTeam(v)}>
                              <SelectTrigger><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="web_dev">Web Dev</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="content">Content</SelectItem>
                                <SelectItem value="sales">Sales</SelectItem>
                              </SelectContent>
                            </Select>
                         </div>
                       )}
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Email</label>
                      <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="john@agency.com" required />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-foreground">Password</label>
                      <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min 6 characters" required minLength={6} />
                    </div>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" disabled={creating} className="w-full md:w-auto">
                      {creating ? 'Creating...' : 'Create Account'}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>Cancel</Button>
                  </div>
                </form>
              </CardContent>
            </MotionCard>
          )}

          <MotionCard delay={0.2} className="border border-border">
            <CardHeader className="border-b border-border pb-3 bg-muted/20">
              <CardTitle className="text-lg flex items-center gap-2">
                <Activity className="h-5 w-5 text-primary" />
                Employee Performance & Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
               {loading ? (
                  <p className="text-muted-foreground text-center py-12 text-sm animate-pulse">Loading employee data...</p>
               ) : employees.length === 0 ? (
                  <p className="text-muted-foreground text-center py-12 text-sm">No employees configured yet.</p>
               ) : (
                  <div className="divide-y divide-border h-[600px] overflow-y-auto">
                    {employees.map((emp) => (
                      <div 
                        key={emp.user_id}
                        onClick={() => navigate(`/admin/employees/${emp.user_id}`)}
                        className="flex items-center justify-between p-4 hover:bg-muted/40 cursor-pointer transition-colors"
                      >
                         <div className="flex items-center gap-4">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                               {emp.name.substring(0,2).toUpperCase()}
                            </div>
                            <div>
                               <p className="font-semibold text-foreground">{emp.name}</p>
                               <p className="text-xs text-muted-foreground">{emp.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-6">
                            <div className="text-right hidden sm:block">
                               <p className="text-lg font-bold font-mono">{emp.todayHours.toFixed(1)}<span className="text-sm font-normal text-muted-foreground ml-0.5">hrs</span></p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Today</p>
                            </div>
                            <div className="text-right hidden sm:block">
                               <p className="text-lg font-bold font-mono">{emp.todayTasks}</p>
                               <p className="text-[10px] text-muted-foreground uppercase tracking-widest leading-none">Tasks</p>
                            </div>
                            <div className="text-right w-24">
                              {emp.todayHours > 0 ? (
                                <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-green-500/10 text-green-500 text-[10px] font-bold uppercase tracking-wider">
                                  <span className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" /> Active
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2 py-1 rounded bg-muted text-muted-foreground text-[10px] font-bold uppercase tracking-wider">
                                  Idle
                                </span>
                              )}
                            </div>
                            <ChevronRight className="h-5 w-5 text-muted-foreground/50" />
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
