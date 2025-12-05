-- Migration: Add support for in-kind donations (goods)
-- Run this in Supabase SQL Editor
-- FIXED VERSION: Won't error if already run

-- Add donation_type column (money or goods)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS donation_type TEXT NOT NULL DEFAULT 'money';

-- Add constraint only if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint 
        WHERE conname = 'donations_donation_type_check'
    ) THEN
        ALTER TABLE public.donations 
        ADD CONSTRAINT donations_donation_type_check 
        CHECK (donation_type IN ('money', 'goods'));
    END IF;
END $$;

-- Add goods_description column for describing donated items
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS goods_description TEXT;

-- Make amount nullable (goods donations don't have monetary amounts)
DO $$ 
BEGIN
    ALTER TABLE public.donations 
    ALTER COLUMN amount DROP NOT NULL;
EXCEPTION
    WHEN OTHERS THEN NULL; -- Ignore if already nullable
END $$;

-- Drop old constraint if it exists
ALTER TABLE public.donations 
DROP CONSTRAINT IF EXISTS donation_type_fields_check;

-- Update existing donations to be 'money' type (already set by default value)
-- No migration needed for existing data since default is 'money'
