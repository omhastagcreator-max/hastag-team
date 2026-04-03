-- STEP 1: CREATE ENUMS AND ALTER PROFILES
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'client';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'sales';

CREATE TYPE public.team_type AS ENUM ('marketing', 'web_dev', 'content', 'sales');

ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS team public.team_type;
