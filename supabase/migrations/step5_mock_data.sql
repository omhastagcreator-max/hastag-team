-- STEP 5: SEED MOCK DATA FOR TESTING
-- CAUTION: RUN THIS SCRIPT ONLY ONCE IN SUPABASE SQL EDITOR

CREATE EXTENSION IF NOT EXISTS pgcrypto;

DO $$ 
DECLARE
  admin_id UUID := gen_random_uuid();
  sakshi_id UUID := gen_random_uuid();
  om_id UUID := gen_random_uuid();
  vellor_id UUID := gen_random_uuid();
  oudfy_id UUID := gen_random_uuid();
  pamya_id UUID := gen_random_uuid();
  
  vellor_deal UUID := gen_random_uuid();
  oudfy_deal UUID := gen_random_uuid();
  pamya_deal UUID := gen_random_uuid();
  
  vellor_proj UUID := gen_random_uuid();
  oudfy_proj UUID := gen_random_uuid();
  pamya_proj UUID := gen_random_uuid();
BEGIN

-- 1. Insert explicitly into auth.users (Requires pgcrypto for password hash)
-- All accounts share the password: password123
INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at)
VALUES
  (admin_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@agency.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"System Admin"}', current_timestamp, current_timestamp),
  (sakshi_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'sakshi@team.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Sakshi"}', current_timestamp, current_timestamp),
  (om_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'om@team.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Om"}', current_timestamp, current_timestamp),
  (vellor_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@vellorliving.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Vellor Living"}', current_timestamp, current_timestamp),
  (oudfy_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@oudfyperfumes.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Oudfy Perfumes"}', current_timestamp, current_timestamp),
  (pamya_id, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'client@pamyajewels.com', crypt('password123', gen_salt('bf')), current_timestamp, '{"provider":"email","providers":["email"]}', '{"name":"Pamya Jewels"}', current_timestamp, current_timestamp);

-- NOTE: The trigger 'handle_new_user' automatically generates profiles and 'employee' roles.
-- We must manually correct the clients' roles!
UPDATE public.user_roles SET role = 'client' WHERE user_id IN (vellor_id, oudfy_id, pamya_id);

-- Explicitly ensure admin gets the admin role
UPDATE public.user_roles SET role = 'admin' WHERE user_id = admin_id;

-- Assign specific employee teams
UPDATE public.profiles SET team = 'marketing' WHERE user_id = sakshi_id;
UPDATE public.profiles SET team = 'web_dev' WHERE user_id = om_id;

-- 2. Create raw Deals (CRM abstraction) for the clients
INSERT INTO public.deals (id, service_type, deal_value, status) VALUES
  (vellor_deal, 'Meta Ads', 5000, 'won'),
  (oudfy_deal, 'Website', 3500, 'won'),
  (pamya_deal, 'Combined', 8000, 'won');

-- 3. Tie Projects precisely to the Deals and Assign specific Leads
INSERT INTO public.projects (id, name, deal_id, project_type, client_id, project_lead_id) VALUES
  (vellor_proj, 'Vellor Meta Expansion', vellor_deal, 'ads', vellor_id, sakshi_id),
  (oudfy_proj, 'Oudfy Store Build', oudfy_deal, 'website', oudfy_id, om_id),
  (pamya_proj, 'Pamya Master Campaign', pamya_deal, 'combined', pamya_id, sakshi_id);

-- 4. Inject specific assigned tasks
INSERT INTO public.project_tasks (project_id, assigned_to, assigned_by, title, task_type, category, status) VALUES
  (pamya_proj, om_id, sakshi_id, 'Inject reviews onto the staging site', 'dev', 'Dev', 'ongoing');
  
END $$;
