CREATE TABLE IF NOT EXISTS public.lead_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.lead_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Sales can manage lead responses" ON public.lead_responses 
  FOR ALL USING (public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'admin'));
