-- Goods Catalog System - Database Schema (FIXED VERSION)
-- Run this in Supabase SQL Editor
-- Won't error if tables already exist

-- =====================================================
-- 1. GOODS ITEMS CATALOG
-- =====================================================
CREATE TABLE IF NOT EXISTS public.goods_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.donation_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  required_quantity TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- =====================================================
-- 2. DONATION ITEMS (Many-to-Many)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.donation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  goods_item_id UUID NOT NULL REFERENCES public.goods_items(id) ON DELETE CASCADE,
  quantity TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES (Create only if not exists)
-- =====================================================
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_goods_items_category') THEN
    CREATE INDEX idx_goods_items_category ON public.goods_items(category_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_items_donation') THEN
    CREATE INDEX idx_donation_items_donation ON public.donation_items(donation_id);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_donation_items_goods_item') THEN
    CREATE INDEX idx_donation_items_goods_item ON public.donation_items(goods_item_id);
  END IF;
END $$;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Goods Items
ALTER TABLE public.goods_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view goods items" ON public.goods_items;
CREATE POLICY "Anyone can view goods items"
  ON public.goods_items FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Only admins can manage goods items" ON public.goods_items;
CREATE POLICY "Only admins can manage goods items"
  ON public.goods_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Donation Items
ALTER TABLE public.donation_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view donation items" ON public.donation_items;
CREATE POLICY "Anyone can view donation items"
  ON public.donation_items FOR SELECT
  USING (TRUE);

DROP POLICY IF EXISTS "Anyone can create donation items" ON public.donation_items;
CREATE POLICY "Anyone can create donation items"
  ON public.donation_items FOR INSERT
  WITH CHECK (TRUE);

DROP POLICY IF EXISTS "Only admins can manage donation items" ON public.donation_items;
CREATE POLICY "Only admins can manage donation items"
  ON public.donation_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));
