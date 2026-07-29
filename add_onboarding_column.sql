-- Run this in your Supabase SQL Editor to track onboarding state
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN DEFAULT false;
