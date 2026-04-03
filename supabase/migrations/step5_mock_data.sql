-- STEP 5: SEED MOCK DATA FOR TESTING
-- CAUTION: RUN THIS SCRIPT ONLY ONCE IN SUPABASE SQL EDITOR

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 1. Insert explicitly into auth.users (Requires pgcrypto for password hash)
-- All accounts share the password: password123
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  ('a1000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"System Admin"}', current_timestamp, current_timestamp),
  ('a2000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sakshi@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Sakshi"}', current_timestamp, current_timestamp),
  ('a3000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'om@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Om"}', current_timestamp, current_timestamp),
  ('a4000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'vellor@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Vellor Living"}', current_timestamp, current_timestamp),
  ('a5000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'oudfy@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Oudfy Perfumes"}', current_timestamp, current_timestamp),
  ('a6000000-0000-0000-0000-000000000000', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'pamya@hastag.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Pamya Jewels"}', current_timestamp, current_timestamp);

-- NOTE: The trigger 'handle_new_user' automatically generates profiles and 'employee' roles.
-- We must manually correct the clients' roles!
UPDATE public.user_roles SET role = 'client' WHERE user_id IN ('a4000000-0000-0000-0000-000000000000', 'a5000000-0000-0000-0000-000000000000', 'a6000000-0000-0000-0000-000000000000');

-- Explicitly ensure admin gets the admin role
UPDATE public.user_roles SET role = 'admin' WHERE user_id = 'a1000000-0000-0000-0000-000000000000';

-- Assign specific employee teams
UPDATE public.profiles SET team = 'marketing' WHERE user_id = 'a2000000-0000-0000-0000-000000000000';
UPDATE public.profiles SET team = 'web_dev' WHERE user_id = 'a3000000-0000-0000-0000-000000000000';

-- 2. Create raw Deals (CRM abstraction) for the clients
INSERT INTO public.deals (id, service_type, deal_value, status) VALUES
  ('d1000000-0000-0000-0000-000000000000', 'Meta Ads', 5000, 'won'),
  ('d2000000-0000-0000-0000-000000000000', 'Website', 3500, 'won'),
  ('d3000000-0000-0000-0000-000000000000', 'Combined', 8000, 'won');

-- 3. Tie Projects precisely to the Deals and Assign specific Leads
INSERT INTO public.projects (id, name, deal_id, project_type, client_id, project_lead_id) VALUES
  ('p1000000-0000-0000-0000-000000000000', 'Vellor Meta Expansion', 'd1000000-0000-0000-0000-000000000000', 'ads', 'a4000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000'),
  ('p2000000-0000-0000-0000-000000000000', 'Oudfy Store Build', 'd2000000-0000-0000-0000-000000000000', 'website', 'a5000000-0000-0000-0000-000000000000', 'a3000000-0000-0000-0000-000000000000'),
  ('p3000000-0000-0000-0000-000000000000', 'Pamya Master Campaign', 'd3000000-0000-0000-0000-000000000000', 'combined', 'a6000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000');

-- 4. Inject specific assigned tasks
INSERT INTO public.project_tasks (id, project_id, assigned_to, assigned_by, title, task_type, category, status) VALUES
  ('t1000000-0000-0000-0000-000000000000', 'p3000000-0000-0000-0000-000000000000', 'a3000000-0000-0000-0000-000000000000', 'a2000000-0000-0000-0000-000000000000', 'Inject reviews onto the staging site', 'dev', 'Dev', 'ongoing');
