-- Add funding_goal column to programs table
-- Run this in Supabase SQL Editor

ALTER TABLE public.programs 
ADD COLUMN IF NOT EXISTS funding_goal NUMERIC;

-- Update existing programs with a default goal (optional)
-- UPDATE public.programs 
-- SET funding_goal = 1000000 
-- WHERE category = 'charity' AND funding_goal IS NULL;
