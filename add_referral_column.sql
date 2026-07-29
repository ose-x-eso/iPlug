-- Run this in your Supabase SQL Editor to support referral tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS referred_by UUID REFERENCES public.profiles(id);
