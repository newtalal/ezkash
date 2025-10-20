-- Create function to delete all user data and account
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Log account deletion
  INSERT INTO public.audit_log (user_id, action, meta_json)
  VALUES (v_user_id, 'account_deleted', jsonb_build_object('deleted_at', now()));

  -- Delete all user data from tables
  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.fixed_expenses WHERE user_id = v_user_id;
  DELETE FROM public.one_time_expenses WHERE user_id = v_user_id;
  DELETE FROM public.audit_log WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE id = v_user_id;
  
  -- Delete the auth user (this is the final step)
  DELETE FROM auth.users WHERE id = v_user_id;
END;
$$;