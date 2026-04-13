import { useEffect, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { SessionTracker } from '@/components/SessionTracker';
import { TaskList } from '@/components/TaskList';
import { TodaySummary } from '@/components/TodaySummary';
import { PageTransition } from '@/components/ui/PageTransition';
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
import { EmployeeTaskBuckets } from '@/components/RoleSpecPanels';
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
          {/* HEADER */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
             <div>
               <h1 className="text-2xl md:text-3xl font-bold tracking-tight">My Dashboard</h1>
               <p className="text-sm text-muted-foreground mt-1">What you need to do now.</p>
             </div>
             <div className="w-full md:w-80">
                <ScreenShareEmployee />
             </div>
          </div>

          {/* SECTION 1 — Today / Overdue / Upcoming buckets (the FIRST thing employees see) */}
          <EmployeeTaskBuckets />

          {/* SECTION 2 — Today's session + tasks list */}
          <div className="grid lg:grid-cols-2 gap-4">
            <SessionTracker />
            <TaskList />
          </div>

          <TodaySummary />

          {/* SECTION 3 — Projects (smaller, secondary) */}
          {projects.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-base font-semibold flex items-center gap-2 text-muted-foreground">
                <Briefcase className="h-4 w-4" /> My Projects
              </h2>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                {projects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => navigate(`/dashboard/projects/${p.id}`)}
                    className="text-left rounded-md border border-border bg-card p-3 hover:border-primary/50 transition-colors"
                  >
                    <p className="font-medium text-sm truncate">{p.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-1 uppercase tracking-wide">{p.project_type}</p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* SECTION 4 — Domain widgets (deepest, role-specific) */}
          {profile?.team === 'web_dev' && <WebDevWidget />}
          {profile?.team === 'marketing' && <MarketingWidget brands={projects} />}
          {profile?.team === 'content' && <ContentWidget brands={projects} />}
        </div>
      </PageTransition>
    </AppLayout>
  );
}
