-- Run this in your Supabase SQL Editor to track skill requests (Distress Beacons)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS is_requesting_skill BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS skill_request_desc TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skill_request_lat FLOAT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS skill_request_lng FLOAT DEFAULT NULL;
