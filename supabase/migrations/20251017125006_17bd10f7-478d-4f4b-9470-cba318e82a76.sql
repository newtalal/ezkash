-- Create fixed_expenses table
CREATE TABLE public.fixed_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,3) NOT NULL CHECK (amount > 0),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create one_time_expenses table
CREATE TABLE public.one_time_expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(10,3) NOT NULL CHECK (amount > 0),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.fixed_expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.one_time_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for fixed_expenses
CREATE POLICY "Users can view their own fixed expenses"
ON public.fixed_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fixed expenses"
ON public.fixed_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fixed expenses"
ON public.fixed_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fixed expenses"
ON public.fixed_expenses FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for one_time_expenses
CREATE POLICY "Users can view their own one-time expenses"
ON public.one_time_expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own one-time expenses"
ON public.one_time_expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own one-time expenses"
ON public.one_time_expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own one-time expenses"
ON public.one_time_expenses FOR DELETE
USING (auth.uid() = user_id);

-- Add triggers for updated_at
CREATE TRIGGER update_fixed_expenses_updated_at
BEFORE UPDATE ON public.fixed_expenses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_one_time_expenses_updated_at
BEFORE UPDATE ON public.one_time_expenses
FOR EACH ROW
EXECUTE FUNCTION public.handle_updated_at();

-- Indexes for performance
CREATE INDEX idx_fixed_expenses_user_id ON public.fixed_expenses(user_id);
CREATE INDEX idx_fixed_expenses_is_paid ON public.fixed_expenses(is_paid);
CREATE INDEX idx_one_time_expenses_user_id ON public.one_time_expenses(user_id);
CREATE INDEX idx_one_time_expenses_is_paid ON public.one_time_expenses(is_paid);