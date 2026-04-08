CREATE TABLE IF NOT EXISTS public.project_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  author_id UUID REFERENCES public.profiles(user_id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  requires_approval BOOLEAN NOT NULL DEFAULT false,
  is_approved BOOLEAN,
  feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins full access to project updates" ON public.project_updates FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Employees can manage updates in their projects" ON public.project_updates FOR ALL USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_updates.project_id AND project_lead_id = auth.uid())
);

CREATE POLICY "Clients can view their project updates" ON public.project_updates FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_updates.project_id AND client_id = auth.uid())
);

CREATE POLICY "Clients can approve their project updates" ON public.project_updates FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.projects WHERE id = project_updates.project_id AND client_id = auth.uid())
);
