-- Add encouragement_enabled column to user_settings table
ALTER TABLE public.user_settings 
ADD COLUMN encouragement_enabled BOOLEAN NOT NULL DEFAULT true;