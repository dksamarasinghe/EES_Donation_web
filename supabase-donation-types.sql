-- Migration: Add support for in-kind donations (goods)
-- Run this in Supabase SQL Editor

-- Add donation_type column (money or goods)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS donation_type TEXT NOT NULL DEFAULT 'money' 
CHECK (donation_type IN ('money', 'goods'));

-- Add goods_description column for describing donated items
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS goods_description TEXT;

-- Make amount nullable (goods donations don't have monetary amounts)
ALTER TABLE public.donations 
ALTER COLUMN amount DROP NOT NULL;

-- Add check constraint: money donations require amount, goods donations require description
ALTER TABLE public.donations 
ADD CONSTRAINT donation_type_fields_check 
CHECK (
  (donation_type = 'money' AND amount IS NOT NULL) OR
  (donation_type = 'goods' AND goods_description IS NOT NULL)
);

-- Update existing donations to be 'money' type (already set by default value)
-- No migration needed for existing data since default is 'money'
