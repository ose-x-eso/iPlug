-- Add phone_visible column to profiles table
-- Default is false to ensure privacy by default.
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS phone_visible BOOLEAN DEFAULT false;
