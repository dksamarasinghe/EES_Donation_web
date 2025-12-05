-- Migration: Add quantity and processing status for goods donations
-- Run this in Supabase SQL Editor after supabase-donation-types.sql

-- Add quantity field (entered by donor when donating goods)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS quantity TEXT;

-- Add processing status for goods donations (managed by admin)
ALTER TABLE public.donations 
ADD COLUMN IF NOT EXISTS processing_status TEXT DEFAULT 'pending' 
CHECK (processing_status IN ('pending', 'received', 'distributed'));

-- Comment: 
-- quantity: Free text field for donor to specify quantity (e.g., "50 notebooks", "10 kg rice")
-- processing_status: 
--   - pending: Donation pledged, goods not yet received
--   - received: Goods received by admin, awaiting distribution
--   - distributed: Goods distributed to beneficiaries
