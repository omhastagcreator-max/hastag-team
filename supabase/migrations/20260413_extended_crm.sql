-- ============================================================================
-- EXTENDED CRM MIGRATION
-- Adds Teams, Client Transactions, and Outstanding Balance Alerts
-- ============================================================================

-- 1. TEAMS STRUCTURE
CREATE TABLE IF NOT EXISTS public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.project_teams (
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  team_id UUID REFERENCES public.teams(id) ON DELETE CASCADE,
  PRIMARY KEY (project_id, team_id)
);

-- 2. CLIENT TRANSACTIONS LEDGER
CREATE TABLE IF NOT EXISTS public.client_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  status TEXT NOT NULL CHECK (status IN ('pending', 'paid', 'overdue')),
  description TEXT NOT NULL,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. CLIENT ALERTS (Outstanding Balance Pop-Ups)
CREATE TABLE IF NOT EXISTS public.client_alerts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  client_id UUID REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  alert_type TEXT NOT NULL DEFAULT 'outstanding_balance',
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. RLS POLICIES

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_alerts ENABLE ROW LEVEL SECURITY;

-- Backfill orgs for safety
UPDATE public.teams SET organization_id = public.default_org_id() WHERE organization_id IS NULL;
UPDATE public.client_transactions SET organization_id = public.default_org_id() WHERE organization_id IS NULL;
UPDATE public.client_alerts SET organization_id = public.default_org_id() WHERE organization_id IS NULL;

-- Teams Policies
DROP POLICY IF EXISTS "org_isolation_select_teams" ON public.teams;
CREATE POLICY "org_isolation_select_teams" ON public.teams FOR SELECT USING (organization_id = public.user_org_id() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Admins manage teams" ON public.teams;
CREATE POLICY "Admins manage teams" ON public.teams FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Project Teams Policies
DROP POLICY IF EXISTS "org_isolation_select_project_teams" ON public.project_teams;
CREATE POLICY "org_isolation_select_project_teams" ON public.project_teams FOR SELECT USING (true); -- Projects govern visibility
DROP POLICY IF EXISTS "Admins manage project_teams" ON public.project_teams;
CREATE POLICY "Admins manage project_teams" ON public.project_teams FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Client Transactions Policies
DROP POLICY IF EXISTS "org_isolation_select_client_transactions" ON public.client_transactions;
CREATE POLICY "org_isolation_select_client_transactions" ON public.client_transactions FOR SELECT USING (organization_id = public.user_org_id() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Clients see own transactions" ON public.client_transactions;
CREATE POLICY "Clients see own transactions" ON public.client_transactions FOR SELECT USING (client_id = auth.uid());
DROP POLICY IF EXISTS "Admins manage transactions" ON public.client_transactions;
CREATE POLICY "Admins manage transactions" ON public.client_transactions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Client Alerts Policies
DROP POLICY IF EXISTS "org_isolation_select_client_alerts" ON public.client_alerts;
CREATE POLICY "org_isolation_select_client_alerts" ON public.client_alerts FOR SELECT USING (organization_id = public.user_org_id() OR public.has_role(auth.uid(), 'admin'));
DROP POLICY IF EXISTS "Clients see own alerts" ON public.client_alerts;
CREATE POLICY "Clients see own alerts" ON public.client_alerts FOR SELECT USING (client_id = auth.uid());
DROP POLICY IF EXISTS "Clients can mark alerts read" ON public.client_alerts;
CREATE POLICY "Clients can mark alerts read" ON public.client_alerts FOR UPDATE USING (client_id = auth.uid());
DROP POLICY IF EXISTS "Admins and Sales manage alerts" ON public.client_alerts;
CREATE POLICY "Admins and Sales manage alerts" ON public.client_alerts FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'sales'));

-- Create Indexes
CREATE INDEX IF NOT EXISTS idx_client_trans_client ON public.client_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_client_alerts_client_read ON public.client_alerts(client_id, is_read);
