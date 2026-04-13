-- ============================================================================
-- STEP 6: ADVANCED MOCK DATA SEEDING
-- Fills all Dashboards, Charts, Logs, and Ledgers to simulate a lived-in CRM
-- ============================================================================

-- Reference constants from step 5:
-- Admin: a1000000-0000-0000-0000-000000000000
-- Employee (Sakshi/Marketing): a2000000-0000-0000-0000-000000000000
-- Employee (Om/Web): a3000000-0000-0000-0000-000000000000
-- Client (Vellor/Ads): a4000000-0000-0000-0000-000000000000 (Proj: b1...)
-- Client (Oudfy/Web): a5000000-0000-0000-0000-000000000000 (Proj: b2...)
-- Client (Pamya/Comb): a6000000-0000-0000-0000-000000000000 (Proj: b3...)

-- CLEANUP PREVIOUS SEEDS FOR SAFETY
DELETE FROM public.activity_logs;
DELETE FROM public.client_transactions;
DELETE FROM public.client_alerts;
DELETE FROM public.project_teams;
DELETE FROM public.teams;
DELETE FROM public.metrics;
DELETE FROM public.project_updates;
DELETE FROM public.project_goals;

-- 1. TEAMS MOCK DATA
INSERT INTO public.teams (id, organization_id, name, description) VALUES 
  ('f1000000-0000-0000-0000-000000000000', public.default_org_id(), 'Growth Hackers', 'Marketing expansion pod'),
  ('f2000000-0000-0000-0000-000000000000', public.default_org_id(), 'Core Engineering', 'Web development structure');

INSERT INTO public.project_teams (project_id, team_id) VALUES
  ('b1000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000000'),
  ('b2000000-0000-0000-0000-000000000000', 'f2000000-0000-0000-0000-000000000000'),
  ('b3000000-0000-0000-0000-000000000000', 'f1000000-0000-0000-0000-000000000000'),
  ('b3000000-0000-0000-0000-000000000000', 'f2000000-0000-0000-0000-000000000000');


-- 2. CLIENT TRANSACTIONS & ALERTS (For Client Deep Dive)
INSERT INTO public.client_transactions (organization_id, client_id, amount, status, description, date) VALUES
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'oudfy@hastag.com' LIMIT 1), 1500.00, 'paid', 'Initial Deposit for Web Build', now() - interval '14 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'oudfy@hastag.com' LIMIT 1), 1000.00, 'pending', 'Mid-point Milestone', now() - interval '2 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'vellor@hastag.com' LIMIT 1), 5000.00, 'paid', 'Q1 Ad Spend Allocation', now() - interval '30 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'pamya@hastag.com' LIMIT 1), 3500.00, 'overdue', 'Brand Discovery Strategy', now() - interval '45 days');

INSERT INTO public.client_alerts (organization_id, client_id, alert_type, message, is_read) VALUES
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'pamya@hastag.com' LIMIT 1), 'outstanding_balance', 'IMPORTANT: You have an outstanding balance constraint of $3,500. Please clear this to unlock next-stage deliveries.', false),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'oudfy@hastag.com' LIMIT 1), 'notification', 'Your staging website is ready for preliminary review. Please check your updates.', false);


-- 3. ACTIVITY LOGS (Simulating Logins for Admin Dashboard Counters)
INSERT INTO public.activity_logs (organization_id, user_id, action, created_at) VALUES 
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'vellor@hastag.com' LIMIT 1), 'login', now() - interval '5 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'vellor@hastag.com' LIMIT 1), 'login', now() - interval '3 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'oudfy@hastag.com' LIMIT 1), 'login', now() - interval '1 day'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'pamya@hastag.com' LIMIT 1), 'login', now() - interval '4 days'),
  (public.default_org_id(), (SELECT user_id FROM public.profiles WHERE email = 'pamya@hastag.com' LIMIT 1), 'login', now() - interval '10 hours');


-- 4. CHART METRICS & GOALS (Populating Client Dashboards & Executive Recharts)
-- Configuring Metric Rules First
INSERT INTO public.metric_config (metric_name, better_direction) VALUES 
  ('ROAS', 'up'),
  ('Cost Per Lead', 'down'),
  ('Store Conversions', 'up')
ON CONFLICT (metric_name) DO NOTHING;

-- Injecting 7 days of ROAS graph curve for Vellor (Project 1)
INSERT INTO public.metrics (project_id, date, metric_name, value) VALUES
  ('b1000000-0000-0000-0000-000000000000', current_date - 6, 'ROAS', 1.8),
  ('b1000000-0000-0000-0000-000000000000', current_date - 5, 'ROAS', 2.1),
  ('b1000000-0000-0000-0000-000000000000', current_date - 4, 'ROAS', 2.4),
  ('b1000000-0000-0000-0000-000000000000', current_date - 3, 'ROAS', 1.9),
  ('b1000000-0000-0000-0000-000000000000', current_date - 2, 'ROAS', 3.0),
  ('b1000000-0000-0000-0000-000000000000', current_date - 1, 'ROAS', 3.4),
  ('b1000000-0000-0000-0000-000000000000', current_date, 'ROAS', 4.1);

INSERT INTO public.project_goals (project_id, title, metric_name, current_value, target_value) VALUES
  ('b1000000-0000-0000-0000-000000000000', 'Hit 5x Return on Facebook', 'ROAS', 4.1, 5.0),
  ('b2000000-0000-0000-0000-000000000000', 'Reach 100 Daily Store Conversions', 'Store Conversions', 42, 100);

-- 5. PROJECT UPDATES (Client Approvable Feeds)
INSERT INTO public.project_updates (project_id, author_id, content, requires_approval, is_approved) VALUES 
  ('b1000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'sakshi@hastag.com' LIMIT 1), 'A/B Testing 3 new video creatives on Facebook. Budget shifted.', true, true),
  ('b2000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'om@hastag.com' LIMIT 1), 'Staging server online. Cart checkout flow is passing standard tests.', true, null),
  ('b3000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'sakshi@hastag.com' LIMIT 1), 'Branding documentation is attached and ready for your review.', false, null);

-- 6. MORE PROJECT TASKS (To make the task lists colorful)
INSERT INTO public.project_tasks (project_id, assigned_to, assigned_by, title, task_type, category, status, priority, due_date) VALUES
  ('b1000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'sakshi@hastag.com' LIMIT 1), (SELECT user_id FROM public.profiles WHERE email = 'admin@hastag.com' LIMIT 1), 'Launch Lookalike Audiences', 'organic', 'Ads', 'ongoing', 'high', now() + interval '2 days'),
  ('b2000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'om@hastag.com' LIMIT 1), (SELECT user_id FROM public.profiles WHERE email = 'admin@hastag.com' LIMIT 1), 'Configure Stripe Webhooks', 'dev', 'Backend', 'done', 'high', now() - interval '1 day'),
  ('b3000000-0000-0000-0000-000000000000', (SELECT user_id FROM public.profiles WHERE email = 'sakshi@hastag.com' LIMIT 1), (SELECT user_id FROM public.profiles WHERE email = 'admin@hastag.com' LIMIT 1), 'Draft Monthly Newsletters', 'organic', 'Content', 'pending', 'medium', now() + interval '5 days');
