-- STEP 4: AUDIT FIXES AND ENHANCEMENTS

-- 1. Add missing fields to profiles and projects
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS deadline DATE;

-- 2. Modify handle_new_user to automatically make the first user an admin.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_count INT;
BEGIN
  INSERT INTO public.profiles (user_id, email, name)
  VALUES (NEW.id, NEW.email, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  
  -- Check if any admin exists
  SELECT count(*) INTO admin_count FROM public.user_roles WHERE role = 'admin';
  
  IF admin_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'employee');
  END IF;
  
  RETURN NEW;
END;
$$;

-- 3. Unify Tasks into project_tasks
ALTER TABLE public.project_tasks ALTER COLUMN project_id DROP NOT NULL;

-- Drop old check constraint and add new one
ALTER TABLE public.project_tasks DROP CONSTRAINT IF EXISTS project_tasks_task_type_check;
ALTER TABLE public.project_tasks ADD CONSTRAINT project_tasks_task_type_check CHECK (task_type IN ('dev', 'ads', 'content', 'admin_task', 'personal'));

-- Add column category and time_spent
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('SEO', 'Ads', 'Design', 'Dev', 'Other'));
ALTER TABLE public.project_tasks ADD COLUMN IF NOT EXISTS time_spent INTEGER;

-- Migrate existing tasks over
INSERT INTO public.project_tasks (assigned_to, title, category, status, time_spent, task_type, created_at)
SELECT user_id, title, category, status, time_spent, 'personal', created_at FROM public.tasks;

-- Drop old tasks table completely
DROP TABLE IF EXISTS public.tasks CASCADE;
