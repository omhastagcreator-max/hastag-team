-- STEP 3: CREATE SCREEN SESSIONS TRACKER
CREATE TABLE IF NOT EXISTS public.screen_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'stopped' CHECK (status IN ('active', 'stopped')),
  started_at TIMESTAMP WITH TIME ZONE
);
ALTER TABLE public.screen_sessions ENABLE ROW LEVEL SECURITY;

-- Admins can read (and technically manage if needed) all sessions
CREATE POLICY "Admin full access screen_sessions" ON public.screen_sessions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Employees can manage their own broadcasting state
CREATE POLICY "Users can manage their own screen_sessions" ON public.screen_sessions FOR ALL USING (auth.uid() = user_id);

-- Explicitly ensure employees cannot select/polute other employee's status:
-- By NOT creating a global SELECT policy, RLS inherently protects it.
