-- Add image_url column to team_members table
-- Run this in Supabase SQL Editor

ALTER TABLE public.team_members 
ADD COLUMN IF NOT EXISTS image_url TEXT;

-- No need for RLS changes, existing policies cover this
