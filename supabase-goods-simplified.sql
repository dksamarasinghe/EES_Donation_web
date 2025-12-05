-- Simplified Goods Management - Update Schema
-- Run this in Supabase SQL Editor

-- Add required_quantity to goods_items table
ALTER TABLE public.goods_items 
ADD COLUMN IF NOT EXISTS required_quantity TEXT;

-- Drop program_goods_requirements table (no longer needed)
DROP TABLE IF EXISTS public.program_goods_requirements CASCADE;

-- Comment: With this simplified approach:
-- - goods_items are linked directly to donation_categories
-- - Each item has its required_quantity stored in the same table
-- - Everything is managed from the Donation Categories page
