CREATE OR REPLACE FUNCTION public.delete_user(target_user_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow admins to delete users
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Only admins can delete users';
  END IF;
  
  -- Delete the user from auth.users (this will cascade to profiles and user_roles if FK has CASCADE)
  DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
