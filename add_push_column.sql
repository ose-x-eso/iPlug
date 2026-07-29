-- Run this in your Supabase SQL Editor to support Push Notifications
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS push_subscription JSONB;
