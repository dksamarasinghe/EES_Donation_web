-- =====================================================
-- CLEANUP SCRIPT - Run this first to remove existing tables
-- Then run the main supabase-schema.sql
-- =====================================================

-- Drop tables in reverse order (to handle foreign keys)
DROP TABLE IF EXISTS public.expenses CASCADE;
DROP TABLE IF EXISTS public.donations CASCADE;
DROP TABLE IF EXISTS public.donation_categories CASCADE;
DROP TABLE IF EXISTS public.program_images CASCADE;
DROP TABLE IF EXISTS public.programs CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop view if exists
DROP VIEW IF EXISTS public.charity_programs_stats CASCADE;

-- Drop storage buckets
DELETE FROM storage.buckets WHERE id IN ('program-images', 'expense-invoices');

-- Drop storage policies
DROP POLICY IF EXISTS "Public can view program images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload program images" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete program images" ON storage.objects;
DROP POLICY IF EXISTS "Public can view expense invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can upload expense invoices" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete expense invoices" ON storage.objects;
