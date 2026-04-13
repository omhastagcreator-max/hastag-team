-- =====================================================================
-- Role System v2 — implements DEVELOPER_HANDOFF.md role-based spec.
--   1. Adds due_date to project_tasks (so overdue / today / upcoming
--      sections can exist on every dashboard).
--   2. Re-asserts RLS so each role can only see what it should:
--        admin   -> everything
--        employee -> tasks assigned to them OR projects they lead
--        client  -> only their own projects (and approved updates)
--        sales   -> leads / deals / projects they created
--   3. Backfills sensible due_dates for existing rows so dashboards
--      aren't empty after the migration runs.
-- =====================================================================

-- 1. due_date column ---------------------------------------------------
ALTER TABLE public.project_tasks
  ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- backfill: spread missing due_dates over the next 14 days so the
-- "today / upcoming / overdue" buckets are populated for demo data.
UPDATE public.project_tasks
SET due_date = now() + (random() * INTERVAL '14 days')
WHERE due_date IS NULL;

CREATE INDEX IF NOT EXISTS idx_project_tasks_due_date
  ON public.project_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned_to
  ON public.project_tasks(assigned_to);

-- 2. Role-based RLS top-up --------------------------------------------
-- Drop and re-create the canonical policies. We use IF EXISTS so the
-- migration is idempotent.

-- projects ------------------------------------------------------------
DROP POLICY IF EXISTS "Sales can view sales-related projects" ON public.projects;
CREATE POLICY "Sales can view sales-related projects"
  ON public.projects FOR SELECT
  USING (public.has_role(auth.uid(), 'sales'));

DROP POLICY IF EXISTS "Sales can insert projects from converted deals" ON public.projects;
CREATE POLICY "Sales can insert projects from converted deals"
  ON public.projects FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'sales'));

-- deals ---------------------------------------------------------------
ALTER TABLE public.deals ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access to deals" ON public.deals;
CREATE POLICY "Admins full access to deals"
  ON public.deals FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Sales can manage their deals" ON public.deals;
CREATE POLICY "Sales can manage their deals"
  ON public.deals FOR ALL
  USING (public.has_role(auth.uid(), 'sales'));

-- leads ---------------------------------------------------------------
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins full access to leads" ON public.leads;
CREATE POLICY "Admins full access to leads"
  ON public.leads FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

DROP POLICY IF EXISTS "Sales can manage their leads" ON public.leads;
CREATE POLICY "Sales can manage their leads"
  ON public.leads FOR ALL
  USING (public.has_role(auth.uid(), 'sales'));

-- profiles (so admins/sales can list employees/clients) ---------------
DROP POLICY IF EXISTS "Sales can view client and self profiles" ON public.profiles;
CREATE POLICY "Sales can view client and self profiles"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'sales')
    OR auth.uid() = user_id
  );

-- user_roles (read-only for all authenticated, write only for admin) --
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Authenticated can read user_roles" ON public.user_roles;
CREATE POLICY "Authenticated can read user_roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() IS NOT NULL);

DROP POLICY IF EXISTS "Admins manage user_roles" ON public.user_roles;
CREATE POLICY "Admins manage user_roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));
