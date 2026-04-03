-- STEP 2: CREATE TABLES AND POLICIES
-- RUN THIS ONLY AFTER RUNNING step1_enums.sql SUCCESSFULLY

-- CREATE leads table
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact TEXT NOT NULL,
  source TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'converted', 'lost')),
  assigned_to UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sales can manage all leads" ON public.leads FOR ALL USING (public.has_role(auth.uid(), 'sales'));

-- CREATE deals table
CREATE TABLE IF NOT EXISTS public.deals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  deal_value NUMERIC NOT NULL DEFAULT 0,
  service_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'won', 'lost')),
  closed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Sales can manage all deals" ON public.deals FOR ALL USING (public.has_role(auth.uid(), 'sales'));

-- DROP EXISTING PROJECT TABLES TO RE-CREATE WITH NEW STRUCTURE
DROP TABLE IF EXISTS public.metrics CASCADE;
DROP TABLE IF EXISTS public.metric_config CASCADE;
DROP TABLE IF EXISTS public.project_goals CASCADE;
DROP TABLE IF EXISTS public.project_tasks CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;

CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  client_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  project_lead_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  project_type TEXT NOT NULL CHECK (project_type IN ('ads', 'website', 'combined')),
  deal_id UUID REFERENCES public.deals(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins have full access to projects" ON public.projects FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view projects they lead" ON public.projects FOR SELECT USING (auth.uid() = project_lead_id);
CREATE POLICY "Employees can update projects they lead" ON public.projects FOR UPDATE USING (auth.uid() = project_lead_id);
CREATE POLICY "Clients can view their own projects" ON public.projects FOR SELECT USING (auth.uid() = client_id);


-- CREATE project_members
CREATE TABLE public.project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role_in_project TEXT NOT NULL CHECK (role_in_project IN ('lead', 'member')),
  UNIQUE(project_id, user_id)
);
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to members" ON public.project_members FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can view members in their projects" ON public.project_members FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_members.project_id AND project_lead_id = auth.uid()) OR user_id = auth.uid()
);
CREATE POLICY "Employees can manage members if lead" ON public.project_members FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_members.project_id AND project_lead_id = auth.uid())
);


-- CREATE project_tasks 
CREATE TABLE public.project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assigned_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  task_type TEXT NOT NULL CHECK (task_type IN ('dev', 'ads', 'content')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ongoing', 'done')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access project tasks" ON public.project_tasks FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can manage tasks in their projects" ON public.project_tasks FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_tasks.project_id AND project_lead_id = auth.uid()) 
  OR assigned_to = auth.uid()
  OR assigned_by = auth.uid()
);
CREATE POLICY "Clients can view tasks in their projects" ON public.project_tasks FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_tasks.project_id AND client_id = auth.uid())
);


-- CREATE project_goals 
CREATE TABLE public.project_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  target_value NUMERIC NOT NULL,
  current_value NUMERIC NOT NULL DEFAULT 0,
  metric_name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);
ALTER TABLE public.project_goals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access goals" ON public.project_goals FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can manage goals in their projects" ON public.project_goals FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_goals.project_id AND project_lead_id = auth.uid())
);
CREATE POLICY "Clients can view goals in their projects" ON public.project_goals FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_goals.project_id AND client_id = auth.uid())
);


-- CREATE metric_config 
CREATE TABLE public.metric_config (
  metric_name TEXT PRIMARY KEY,
  better_direction TEXT NOT NULL CHECK (better_direction IN ('up', 'down'))
);
ALTER TABLE public.metric_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read metric config" ON public.metric_config FOR SELECT USING (true);
CREATE POLICY "Only admins manage metric config" ON public.metric_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));


-- CREATE metrics 
CREATE TABLE public.metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  metric_name TEXT REFERENCES public.metric_config(metric_name) ON DELETE RESTRICT NOT NULL,
  value NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(project_id, date, metric_name)
);
ALTER TABLE public.metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access metrics" ON public.metrics FOR ALL USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Employees can manage metrics in their projects" ON public.metrics FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = metrics.project_id AND project_lead_id = auth.uid())
);
CREATE POLICY "Clients can view metrics in their projects" ON public.metrics FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = metrics.project_id AND client_id = auth.uid())
);

-- Seed Metric Configs
INSERT INTO public.metric_config (metric_name, better_direction) VALUES 
('Leads', 'up'),
('CTR', 'up'),
('ROAS', 'up'),
('Conversations', 'up'),
('Sales', 'up'),
('CPC', 'down'),
('CPA', 'down'),
('Bounce Rate', 'down')
ON CONFLICT DO NOTHING;
