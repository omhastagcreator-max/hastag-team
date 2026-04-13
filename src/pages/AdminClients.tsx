import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Briefcase, Building2, UserCircle2, ArrowUpRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface ClientProfile {
  user_id: string;
  name: string;
  email: string;
  total_deal_value: number;
  projects_count: number;
  recent_projects: string[];
  login_count: number;
}

export default function AdminClients() {
  const [clients, setClients] = useState<ClientProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchClients = async () => {
      // Fetch all roles to find clients
      const { data: rolesData } = await supabase.from('user_roles').select('user_id').eq('role', 'client');
      if (!rolesData) return;
      const clientIds = rolesData.map(r => r.user_id);

      // Fetch profiles
      const { data: profilesData } = await supabase.from('profiles').select('user_id, name, email').in('user_id', clientIds);
      
      const { data: projectsData } = await supabase.from('projects').select('client_id, name, deal_id').in('client_id', clientIds);
      
      const { data: dealsData } = await supabase.from('deals').select('id, deal_value');

      const { data: activityLogs } = await supabase.from('activity_logs').select('user_id').eq('action', 'login').in('user_id', clientIds);

      if (profilesData) {
        const aggregatedClients = profilesData.map(prof => {
          const clientProjects = projectsData?.filter(p => p.client_id === prof.user_id) || [];
          
          let totalValue = 0;
          clientProjects.forEach(cp => {
             if (cp.deal_id) {
                const deal = dealsData?.find(d => d.id === cp.deal_id);
                if (deal) totalValue += Number(deal.deal_value);
             }
          });

          return {
            ...prof,
            total_deal_value: totalValue,
            projects_count: clientProjects.length,
            recent_projects: clientProjects.slice(0, 2).map(p => p.name),
            login_count: activityLogs?.filter(log => log.user_id === prof.user_id).length || 0
          };
        });

        setClients(aggregatedClients);
      }
      setLoading(false);
    };

    fetchClients();
  }, []);

  if (loading) {
     return (
       <AppLayout requiredRole="admin">
          <div className="flex items-center justify-center min-h-screen">
             <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
       </AppLayout>
     );
  }

  return (
    <AppLayout requiredRole="admin">
      <PageTransition>
        <div className="max-w-6xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm flex items-center gap-2">
              <Building2 className="h-8 w-8 text-primary" />
              Clients Hub
            </h1>
            <Button onClick={() => navigate('/admin/projects')}>Manage Projects</Button>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {clients.map((client, i) => (
              <MotionCard onClick={() => navigate(`/admin/clients/${client.user_id}`)} key={client.user_id} delay={0.1 * i} className="hover:border-primary/50 cursor-pointer transition-colors border-border/50 bg-background/50 backdrop-blur">
                <CardHeader className="pb-2">
                   <div className="flex justify-between items-start">
                     <div className="flex items-center gap-3">
                        <UserCircle2 className="h-10 w-10 text-muted-foreground opacity-50" />
                        <div>
                           <CardTitle className="text-lg hover:underline">{client.name}</CardTitle>
                           <p className="text-xs text-muted-foreground">{client.email}</p>
                        </div>
                     </div>
                   </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-4">
                   <div className="grid grid-cols-3 gap-4">
                     <div className="p-3 bg-muted/40 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Total Deal LTV</p>
                        <p className="text-sm font-bold text-green-500">₹{client.total_deal_value.toLocaleString()}</p>
                     </div>
                     <div className="p-3 bg-muted/40 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Active Projects</p>
                        <p className="text-sm font-bold">{client.projects_count}</p>
                     </div>
                     <div className="p-3 bg-muted/40 rounded-lg">
                        <p className="text-xs text-muted-foreground mb-1">Total Logins</p>
                        <p className="text-sm font-bold text-accent">{client.login_count}</p>
                     </div>
                   </div>
                   
                   {client.recent_projects.length > 0 && (
                     <div className="pt-2">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                          <Briefcase className="h-3 w-3" /> Linked Projects
                        </p>
                        <div className="flex flex-wrap gap-2">
                           {client.recent_projects.map(rp => (
                             <span key={rp} className="text-xs bg-primary/10 text-primary border border-primary/20 px-2 py-1 rounded">
                               {rp}
                             </span>
                           ))}
                           {client.projects_count > 2 && <span className="text-xs px-2 py-1 text-muted-foreground">+{client.projects_count - 2} more</span>}
                        </div>
                     </div>
                   )}
                </CardContent>
              </MotionCard>
            ))}

            {clients.length === 0 && (
              <div className="col-span-3 text-center py-12 text-muted-foreground bg-muted/20 rounded-xl border border-dashed">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-20" />
                No clients have been boarded yet.
              </div>
            )}
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
