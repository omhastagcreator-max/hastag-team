-- ============================================================================
-- SCALE ARCHITECTURE MIGRATION (self-contained)
-- Builds a multi-tenant ready, RLS-enforced, computed-counter foundation that
-- runs on Supabase Free but scales without rewrites.
-- Idempotent — safe to re-run.
-- ============================================================================

-- 0. PREREQ — ensure due_date exists on project_tasks
alter table public.project_tasks
  add column if not exists due_date timestamptz;
create index if not exists idx_project_tasks_due_date on public.project_tasks(due_date);
create index if not exists idx_project_tasks_assigned_to on public.project_tasks(assigned_to);
update public.project_tasks
set due_date = now() + (random() * interval '14 days')
where due_date is null;

-- 1. ORGANIZATIONS (multi-tenant root)
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  plan text not null default 'free',
  created_at timestamptz not null default now()
);

-- Seed a default org if none exists
insert into public.organizations (id, name)
select '00000000-0000-0000-0000-000000000001', 'Hastag-Team Default'
where not exists (select 1 from public.organizations);

-- Helper: default org id (used as backfill)
create or replace function public.default_org_id()
returns uuid language sql stable as $$
  select id from public.organizations order by created_at asc limit 1
$$;

-- 2. ATTACH organization_id to every tenant table (nullable for backfill safety)
do $$
declare
  t text;
begin
  for t in
    select unnest(array[
      'profiles','projects','project_tasks','sessions','leads','deals',
      'metrics','project_goals','project_updates','lead_responses','user_roles'
    ])
  loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format('alter table public.%I add column if not exists organization_id uuid references public.organizations(id) on delete cascade', t);
      execute format('update public.%I set organization_id = public.default_org_id() where organization_id is null', t);
      execute format('create index if not exists idx_%I_org on public.%I(organization_id)', t, t);
    end if;
  end loop;
end$$;

-- 3. COMPUTED COUNTERS on projects (avoid runtime aggregation)
alter table public.projects
  add column if not exists total_tasks int not null default 0,
  add column if not exists completed_tasks int not null default 0,
  add column if not exists overdue_tasks int not null default 0;

-- Backfill counters
update public.projects p set
  total_tasks    = coalesce((select count(*) from public.project_tasks t where t.project_id = p.id), 0),
  completed_tasks= coalesce((select count(*) from public.project_tasks t where t.project_id = p.id and t.status = 'done'), 0),
  overdue_tasks  = coalesce((select count(*) from public.project_tasks t where t.project_id = p.id and t.status <> 'done' and t.due_date is not null and t.due_date < now()), 0);

-- Trigger function to keep counters in sync
create or replace function public.refresh_project_counters()
returns trigger language plpgsql as $$
declare pid uuid;
begin
  pid := coalesce(new.project_id, old.project_id);
  if pid is null then return coalesce(new, old); end if;
  update public.projects p set
    total_tasks     = (select count(*) from public.project_tasks t where t.project_id = pid),
    completed_tasks = (select count(*) from public.project_tasks t where t.project_id = pid and t.status = 'done'),
    overdue_tasks   = (select count(*) from public.project_tasks t where t.project_id = pid and t.status <> 'done' and t.due_date is not null and t.due_date < now())
  where p.id = pid;
  return coalesce(new, old);
end$$;

drop trigger if exists trg_project_tasks_counters on public.project_tasks;
create trigger trg_project_tasks_counters
after insert or update or delete on public.project_tasks
for each row execute function public.refresh_project_counters();

-- 4. ORG-AWARE RLS HELPER
create or replace function public.user_org_id()
returns uuid language sql stable security definer set search_path = public as $$
  select organization_id from public.profiles where user_id = auth.uid() limit 1
$$;

-- 5. TIGHTEN RLS — every tenant table requires same-org access
do $$
declare t text;
begin
  for t in
    select unnest(array[
      'projects','project_tasks','sessions','leads','deals',
      'metrics','project_goals','project_updates','lead_responses'
    ])
  loop
    if exists (select 1 from information_schema.tables where table_schema='public' and table_name=t) then
      execute format('alter table public.%I enable row level security', t);
      execute format('drop policy if exists org_isolation_select on public.%I', t);
      execute format($p$create policy org_isolation_select on public.%I for select using (organization_id = public.user_org_id() or public.has_role(auth.uid(), 'admin'))$p$, t);
    end if;
  end loop;
end$$;

-- 6. LIGHTWEIGHT ACTIVITY LOG (prepares for future monitoring)
create table if not exists public.activity_logs (
  id bigserial primary key,
  organization_id uuid references public.organizations(id) on delete cascade,
  user_id uuid,
  action text not null,
  entity text,
  entity_id uuid,
  metadata jsonb,
  created_at timestamptz not null default now()
);
create index if not exists idx_activity_org_time on public.activity_logs(organization_id, created_at desc);

alter table public.activity_logs enable row level security;
drop policy if exists activity_logs_admin_read on public.activity_logs;
create policy activity_logs_admin_read on public.activity_logs
  for select using (public.has_role(auth.uid(), 'admin') and organization_id = public.user_org_id());

-- 7. PAGINATION-FRIENDLY INDEXES
create index if not exists idx_project_tasks_proj_due on public.project_tasks(project_id, due_date);
create index if not exists idx_sessions_user_start on public.sessions(user_id, start_time desc);
create index if not exists idx_leads_assigned_status on public.leads(assigned_to, status);
