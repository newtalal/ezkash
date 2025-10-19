-- Enhance profiles table with additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT,
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS is_phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;

-- Make username required and unique
ALTER TABLE public.profiles 
ALTER COLUMN username SET NOT NULL;

-- Add unique constraint on username (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_unique ON public.profiles (LOWER(username));

-- Add unique constraint on phone if provided
CREATE UNIQUE INDEX IF NOT EXISTS profiles_phone_unique ON public.profiles (phone) WHERE phone IS NOT NULL;

-- Create audit_log table for security events
CREATE TABLE IF NOT EXISTS public.audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  meta_json JSONB,
  ip_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS audit_log_user_id_idx ON public.audit_log(user_id);
CREATE INDEX IF NOT EXISTS audit_log_created_at_idx ON public.audit_log(created_at DESC);
CREATE INDEX IF NOT EXISTS audit_log_action_idx ON public.audit_log(action);

-- Create strings table for bilingual UI labels
CREATE TABLE IF NOT EXISTS public.strings (
  key TEXT PRIMARY KEY,
  en TEXT NOT NULL,
  ar TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert common auth strings
INSERT INTO public.strings (key, en, ar) VALUES
  ('auth.login.title', 'Sign In', 'تسجيل الدخول'),
  ('auth.register.title', 'Create Account', 'إنشاء حساب'),
  ('auth.forgot_password', 'Forgot Password?', 'نسيت كلمة السر؟'),
  ('auth.forgot_username', 'Forgot Username?', 'نسيت اسم المستخدم؟'),
  ('auth.full_name', 'Full Name', 'الاسم الكامل'),
  ('auth.username', 'Username', 'اسم المستخدم'),
  ('auth.email', 'Email', 'البريد الإلكتروني'),
  ('auth.phone', 'Phone (Optional)', 'الهاتف (اختياري)'),
  ('auth.password', 'Password', 'كلمة السر'),
  ('auth.confirm_password', 'Confirm Password', 'تأكيد كلمة السر'),
  ('auth.agree_terms', 'I agree to Terms & Privacy', 'أوافق على الشروط والخصوصية'),
  ('auth.sign_in', 'Sign In', 'تسجيل الدخول'),
  ('auth.sign_up', 'Sign Up', 'التسجيل'),
  ('auth.remember_me', 'Remember me', 'تذكرني'),
  ('auth.already_have_account', 'Already have an account?', 'هل لديك حساب؟'),
  ('auth.dont_have_account', 'Don''t have an account?', 'ليس لديك حساب؟'),
  ('profile.title', 'Profile & Security', 'الملف الشخصي والأمان'),
  ('profile.update', 'Update Profile', 'تحديث الملف الشخصي'),
  ('profile.change_password', 'Change Password', 'تغيير كلمة السر'),
  ('profile.current_password', 'Current Password', 'كلمة السر الحالية'),
  ('profile.new_password', 'New Password', 'كلمة السر الجديدة'),
  ('profile.sessions', 'Active Sessions', 'الجلسات النشطة'),
  ('profile.logout_all', 'Logout All Devices', 'تسجيل الخروج من جميع الأجهزة'),
  ('profile.delete_account', 'Delete Account', 'حذف الحساب'),
  ('common.save', 'Save', 'حفظ'),
  ('common.cancel', 'Cancel', 'إلغاء')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on audit_log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Users can view their own audit logs
CREATE POLICY "Users can view their own audit logs"
ON public.audit_log
FOR SELECT
USING (auth.uid() = user_id);

-- Enable RLS on strings (public read)
ALTER TABLE public.strings ENABLE ROW LEVEL SECURITY;

-- Everyone can read strings
CREATE POLICY "Strings are publicly readable"
ON public.strings
FOR SELECT
USING (true);

-- Create function to log audit events
CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_action TEXT,
  p_meta_json JSONB DEFAULT NULL,
  p_ip_hash TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_log_id UUID;
BEGIN
  INSERT INTO public.audit_log (user_id, action, meta_json, ip_hash)
  VALUES (auth.uid(), p_action, p_meta_json, p_ip_hash)
  RETURNING id INTO v_log_id;
  
  RETURN v_log_id;
END;
$$;

-- Update trigger for strings
CREATE TRIGGER update_strings_updated_at
  BEFORE UPDATE ON public.strings
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();