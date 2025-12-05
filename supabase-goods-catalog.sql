-- Goods Catalog System - Database Schema
-- Run this in Supabase SQL Editor

-- =====================================================
-- 1. GOODS ITEMS CATALOG
-- =====================================================
-- Predefined items that can be donated (e.g., Notebooks, Pens)

CREATE TABLE IF NOT EXISTS public.goods_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.donation_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, name)
);

-- =====================================================
-- 2. PROGRAM GOODS REQUIREMENTS
-- =====================================================
-- What items and quantities are needed for each program

CREATE TABLE IF NOT EXISTS public.program_goods_requirements (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  goods_item_id UUID NOT NULL REFERENCES public.goods_items(id) ON DELETE CASCADE,
  required_quantity TEXT NOT NULL, -- e.g., "100", "10 kg"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, goods_item_id)
);

-- =====================================================
-- 3. DONATION ITEMS (Many-to-Many)
-- =====================================================
-- Individual items donated in a goods donation

CREATE TABLE IF NOT EXISTS public.donation_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donation_id UUID NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  goods_item_id UUID NOT NULL REFERENCES public.goods_items(id) ON DELETE CASCADE,
  quantity TEXT NOT NULL, -- e.g., "50", "5 kg"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES
-- =====================================================

CREATE INDEX idx_goods_items_category ON public.goods_items(category_id);
CREATE INDEX idx_program_goods_requirements_program ON public.program_goods_requirements(program_id);
CREATE INDEX idx_program_goods_requirements_item ON public.program_goods_requirements(goods_item_id);
CREATE INDEX idx_donation_items_donation ON public.donation_items(donation_id);
CREATE INDEX idx_donation_items_goods_item ON public.donation_items(goods_item_id);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Goods Items
ALTER TABLE public.goods_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view goods items"
  ON public.goods_items FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage goods items"
  ON public.goods_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Program Goods Requirements
ALTER TABLE public.program_goods_requirements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view program requirements"
  ON public.program_goods_requirements FOR SELECT
  USING (TRUE);

CREATE POLICY "Only admins can manage requirements"
  ON public.program_goods_requirements FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Donation Items
ALTER TABLE public.donation_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view donation items"
  ON public.donation_items FOR SELECT
  USING (TRUE);

CREATE POLICY "Anyone can create donation items"
  ON public.donation_items FOR INSERT
  WITH CHECK (TRUE);

CREATE POLICY "Only admins can manage donation items"
  ON public.donation_items FOR ALL
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- =====================================================
-- CLEANUP OLD COLUMNS (Optional)
-- =====================================================
-- If you ran previous migrations, these columns are no longer needed
-- Uncomment if you want to clean up:

-- ALTER TABLE public.donations DROP COLUMN IF EXISTS goods_description;
-- ALTER TABLE public.donations DROP COLUMN IF EXISTS quantity;
-- ALTER TABLE public.donations DROP COLUMN IF EXISTS processing_status;
