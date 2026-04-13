import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Briefcase, Users2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface Profile {
  user_id: string;
  name: string;
  email: string;
}

interface Project {
  id: string;
  name: string;
  project_type: string;
  client_id: string | null;
  project_lead_id: string | null;
  client?: { name: string; email: string };
  lead?: { name: string; email: string };
  teams?: string[];
}

interface Team {
  id: string;
  name: string;
}

export default function AdminProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [employees, setEmployees] = useState<Profile[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [deals, setDeals] = useState<{id: string; lead: {name: string}}[]>([]);
  const [teamsList, setTeamsList] = useState<Team[]>([]);
  
  // Project Form state
  const [name, setName] = useState('');
  const [type, setType] = useState('combined');
  const [clientId, setClientId] = useState('');
  const [dealId, setDealId] = useState('');
  const [projectTeamId, setProjectTeamId] = useState('');

  // Team Form State
  const [teamName, setTeamName] = useState('');

  const fetchData = async () => {
    setLoading(true);
    // Fetch all profiles and roles
    const { data: rolesData } = await supabase.from('user_roles').select('user_id, role');
    const { data: profilesData } = await supabase.from('profiles').select('user_id, name, email');
    
    if (rolesData && profilesData) {
      const empIds = rolesData.filter(r => r.role === 'employee').map(r => r.user_id);
      const cliIds = rolesData.filter(r => r.role === 'client').map(r => r.user_id);
      
      setEmployees(profilesData.filter(p => empIds.includes(p.user_id)));
      setClients(profilesData.filter(p => cliIds.includes(p.user_id)));
    }

    const { data: dealsData } = await supabase.from('deals').select('id, leads(name)').eq('status', 'won');
    if (dealsData) setDeals(dealsData.map(d => ({id: d.id, lead: {name: d.leads?.name || 'Unknown'}})));

    const { data: teamsData } = await supabase.from('teams').select('id, name');
    if (teamsData) setTeamsList(teamsData);

    const { data: projData } = await supabase.from('projects').select('*, project_teams(teams(name))').order('created_at', { ascending: false });
    if (projData) {
      const enriched = projData.map(p => ({
        ...p,
        client: profilesData?.find(profile => profile.user_id === p.client_id),
        lead: profilesData?.find(profile => profile.user_id === p.project_lead_id),
        teams: p.project_teams?.map((pt: any) => pt.teams?.name).filter(Boolean) || [],
      }));
      setProjects(enriched as unknown as Project[]);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !clientId || !leadId) return toast.error('Please fill all fields');
    
    const { data, error } = await supabase.from('projects').insert({
      name,
      project_type: type,
      client_id: clientId,
      project_lead_id: leadId,
      deal_id: dealId || null
    }).select();
    
    if (error) {
      toast.error('Failed to create project');
    } else {
      if (projectTeamId && data) {
         await supabase.from('project_teams').insert({ project_id: data[0].id, team_id: projectTeamId });
      }
      toast.success('Project created');
      setName('');
      setDealId('');
      setProjectTeamId('');
      fetchData();
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName) return;
    const { error } = await supabase.from('teams').insert({ name: teamName });
    if (error) toast.error('Failed to create Team');
    else {
      toast.success('Team created');
      setTeamName('');
      fetchData();
    }
  };

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Projects Management
          </h1>

          <div className="grid md:grid-cols-3 gap-6">
            <MotionCard delay={0.1} className="md:col-span-1 border border-border/50 shadow-md">
              <CardHeader>
                <CardTitle>Create Project</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Project Name</label>
                    <Input value={name} onChange={e => setName(e.target.value)} required placeholder="e.g. Acme Corp Build" className="bg-background/50" />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Link Deal (Optional)</label>
                    <Select value={dealId} onValueChange={setDealId}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Won Deal" /></SelectTrigger>
                      <SelectContent>
                        {deals.map(d => <SelectItem key={d.id} value={d.id}>{d.lead.name} Deal</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Project Type</label>
                    <Select value={type} onValueChange={setType}>
                      <SelectTrigger className="bg-background/50"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ads">Marketing Ads</SelectItem>
                        <SelectItem value="website">Website</SelectItem>
                        <SelectItem value="combined">Combined</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Assign Client</label>
                    <Select value={clientId} onValueChange={setClientId}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Client" /></SelectTrigger>
                      <SelectContent>
                        {clients.map(c => <SelectItem key={c.user_id} value={c.user_id}>{c.name || c.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Project Lead</label>
                    <Select value={leadId} onValueChange={setLeadId}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Lead" /></SelectTrigger>
                      <SelectContent>
                        {employees.map(e => <SelectItem key={e.user_id} value={e.user_id}>{e.name || e.email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Link Team (Optional)</label>
                    <Select value={projectTeamId} onValueChange={setProjectTeamId}>
                      <SelectTrigger className="bg-background/50"><SelectValue placeholder="Select Team" /></SelectTrigger>
                      <SelectContent>
                        {teamsList.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full mt-2 group shadow-sm bg-primary/90 hover:bg-primary">Create Project 🚀</Button>
                </form>
              </CardContent>
            </MotionCard>
            
            <div className="md:col-span-1 space-y-6">
              <MotionCard delay={0.15} className="border border-border/50 shadow-md">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2"><Users2 className="h-5 w-5" /> Teams Mgt</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium">New Team Name</label>
                      <Input value={teamName} onChange={e => setTeamName(e.target.value)} required placeholder="e.g. Content Pod A" className="bg-background/50" />
                    </div>
                    <Button type="submit" variant="secondary" className="w-full">Create Team</Button>
                  </form>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {teamsList.map(t => <span key={t.id} className="text-xs bg-muted border border-border px-2 py-1 rounded">{t.name}</span>)}
                  </div>
                </CardContent>
              </MotionCard>
            </div>
            
            <MotionCard delay={0.2} className="md:col-span-2">
              <CardHeader>
                <CardTitle>Active Projects</CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </div>
                ) : projects.length === 0 ? <p className="text-muted-foreground">No projects yet.</p> : (
                  <div className="space-y-4">
                    {projects.map(p => (
                      <div key={p.id} className="p-4 border border-border/50 rounded-lg hover:bg-muted/40 transition-colors">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">{p.project_type}</p>
                          </div>
                          <div className="text-right text-sm">
                            <p><span className="text-muted-foreground">Client: </span> {p.client?.name || p.client?.email || 'Unknown'}</p>
                            <p><span className="text-muted-foreground">Lead: </span> {p.lead?.name || p.lead?.email || 'Unknown'}</p>
                          </div>
                        </div>
                        {p.teams && p.teams.length > 0 && (
                          <div className="mt-3 flex gap-2">
                            {p.teams.map(t => <span key={t} className="text-[10px] uppercase tracking-wider bg-primary/10 text-primary px-2 py-1 rounded">{t}</span>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </MotionCard>
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
