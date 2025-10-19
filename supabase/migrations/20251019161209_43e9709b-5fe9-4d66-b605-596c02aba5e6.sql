-- Update the handle_new_user trigger to include new fields
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, phone)
  VALUES (
    new.id,
    LOWER(TRIM(COALESCE(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))),
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    COALESCE(new.raw_user_meta_data->>'phone', NULL)
  );
  
  -- Log user registration
  INSERT INTO public.audit_log (user_id, action, meta_json)
  VALUES (new.id, 'user_registered', jsonb_build_object('email', new.email));
  
  RETURN new;
END;
$$;

-- Create function to update last login
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles
  SET last_login_at = NOW(),
      failed_login_attempts = 0,
      account_locked_until = NULL
  WHERE id = auth.uid();
  
  -- Log successful login
  INSERT INTO public.audit_log (user_id, action)
  VALUES (auth.uid(), 'login_success');
END;
$$;