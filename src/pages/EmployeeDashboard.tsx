import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SessionTracker } from '@/components/SessionTracker';
import { TaskList } from '@/components/TaskList';
import { TodaySummary } from '@/components/TodaySummary';
import { PageTransition } from '@/components/ui/PageTransition';
import { MotionCard } from '@/components/ui/MotionCard';
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Briefcase } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  project_type: string;
}

import { ScreenShareEmployee } from '@/components/ScreenShareEmployee';
import { WebDevWidget } from '@/components/domain/WebDevWidget';
import { MarketingWidget } from '@/components/domain/MarketingWidget';
import { ContentWidget } from '@/components/domain/ContentWidget';
export default function EmployeeDashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      const { data } = await supabase.from('projects').select('id, name, project_type').eq('project_lead_id', user.id).order('created_at', { ascending: false });
      if (data) setProjects(data);
    };
    fetchProjects();
  }, [user]);

  return (
    <AppLayout requiredRole="employee">
      <PageTransition>
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
             <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/60 drop-shadow-sm">My Dashboard</h1>
             <div className="w-80">
                <ScreenShareEmployee />
             </div>
          </div>
          
          {projects.length > 0 && (
            <div className="space-y-4">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-primary" /> My Projects
              </h2>
              <div className="grid md:grid-cols-3 gap-4">
                {projects.map((p, i) => (
                  <div key={p.id} onClick={() => navigate(`/employee/dashboard/projects/${p.id}`)} className="cursor-pointer">
                    <MotionCard delay={0.1 * i} className="hover:border-primary/50">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{p.name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground bg-muted w-max px-2 py-1 rounded">{p.project_type}</p>
                      </CardContent>
                    </MotionCard>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Domain-specific widgets inserted dynamically before universal wrappers */}
          {profile?.team === 'web_dev' && <WebDevWidget />}
          {profile?.team === 'marketing' && <MarketingWidget brands={projects} />}
          {profile?.team === 'content' && <ContentWidget brands={projects} />}

          <TodaySummary />
          <div className="grid md:grid-cols-2 gap-6">
            <SessionTracker />
            <TaskList />
          </div>
        </div>
      </PageTransition>
    </AppLayout>
  );
}
