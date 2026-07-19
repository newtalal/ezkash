
-- category_budgets
CREATE TABLE public.category_budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  category TEXT NOT NULL,
  monthly_limit NUMERIC NOT NULL CHECK (monthly_limit >= 0),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT category_budgets_user_category_unique UNIQUE (user_id, category)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.category_budgets TO authenticated;
GRANT ALL ON public.category_budgets TO service_role;

ALTER TABLE public.category_budgets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own category budgets"
ON public.category_budgets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own category budgets"
ON public.category_budgets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own category budgets"
ON public.category_budgets FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own category budgets"
ON public.category_budgets FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_category_budgets_updated_at
BEFORE UPDATE ON public.category_budgets
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- merchant_category_rules
CREATE TABLE public.merchant_category_rules (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  merchant_keyword TEXT NOT NULL,
  category TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  CONSTRAINT merchant_rules_user_keyword_unique UNIQUE (user_id, merchant_keyword)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.merchant_category_rules TO authenticated;
GRANT ALL ON public.merchant_category_rules TO service_role;

ALTER TABLE public.merchant_category_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own merchant rules"
ON public.merchant_category_rules FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own merchant rules"
ON public.merchant_category_rules FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own merchant rules"
ON public.merchant_category_rules FOR UPDATE USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own merchant rules"
ON public.merchant_category_rules FOR DELETE USING (auth.uid() = user_id);

CREATE TRIGGER update_merchant_category_rules_updated_at
BEFORE UPDATE ON public.merchant_category_rules
FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add UPDATE policy for categories (rename support)
CREATE POLICY "Users can update their own categories"
ON public.categories FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Update account deletion cleanup
CREATE OR REPLACE FUNCTION public.delete_user_account()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user_id uuid;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  INSERT INTO public.audit_log (user_id, action, meta_json)
  VALUES (v_user_id, 'account_deleted', jsonb_build_object('deleted_at', now()));

  DELETE FROM public.transactions WHERE user_id = v_user_id;
  DELETE FROM public.fixed_expenses WHERE user_id = v_user_id;
  DELETE FROM public.one_time_expenses WHERE user_id = v_user_id;
  DELETE FROM public.accounts WHERE user_id = v_user_id;
  DELETE FROM public.categories WHERE user_id = v_user_id;
  DELETE FROM public.category_budgets WHERE user_id = v_user_id;
  DELETE FROM public.merchant_category_rules WHERE user_id = v_user_id;
  DELETE FROM public.user_settings WHERE user_id = v_user_id;
  DELETE FROM public.audit_log WHERE user_id = v_user_id;
  DELETE FROM public.profiles WHERE id = v_user_id;

  DELETE FROM auth.users WHERE id = v_user_id;
END;
$function$;
