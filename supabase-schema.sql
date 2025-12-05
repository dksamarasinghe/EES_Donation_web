-- =====================================================
-- EES Society Database Schema for Supabase
-- University of Sri Jayewardenepura
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- TABLES
-- =====================================================

-- Users table (extends Supabase auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Programs table (events, projects, charity programs)
CREATE TABLE public.programs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('event', 'project', 'charity')),
  description TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  total_cost DECIMAL(10, 2), -- Only for charity programs
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.programs ENABLE ROW LEVEL SECURITY;

-- Program images table
CREATE TABLE public.program_images (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.program_images ENABLE ROW LEVEL SECURITY;

-- Donation categories table
CREATE TABLE public.donation_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(program_id, name)
);

ALTER TABLE public.donation_categories ENABLE ROW LEVEL SECURITY;

-- Donations table
CREATE TABLE public.donations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  donor_name TEXT NOT NULL,
  donor_address TEXT NOT NULL,
  donor_contact TEXT NOT NULL,
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.donation_categories(id) ON DELETE CASCADE,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  donation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.donations ENABLE ROW LEVEL SECURITY;

-- Expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  program_id UUID NOT NULL REFERENCES public.programs(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  expense_date DATE NOT NULL,
  invoice_url TEXT, -- URL to invoice/bill in Supabase Storage
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- INDEXES for better query performance
-- =====================================================

CREATE INDEX idx_programs_category ON public.programs(category);
CREATE INDEX idx_programs_status ON public.programs(status);
CREATE INDEX idx_programs_date ON public.programs(date DESC);
CREATE INDEX idx_program_images_program_id ON public.program_images(program_id);
CREATE INDEX idx_donation_categories_program_id ON public.donation_categories(program_id);
CREATE INDEX idx_donations_program_id ON public.donations(program_id);
CREATE INDEX idx_donations_date ON public.donations(donation_date DESC);
CREATE INDEX idx_expenses_program_id ON public.expenses(program_id);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for programs table
CREATE TRIGGER update_programs_updated_at
  BEFORE UPDATE ON public.programs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger for expenses table
CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS
-- =====================================================

-- View for charity program statistics with donations and expenses
CREATE OR REPLACE VIEW public.charity_programs_stats AS
SELECT 
  p.id,
  p.title,
  p.total_cost,
  COALESCE(SUM(d.amount), 0) AS amount_raised,
  COALESCE(SUM(e.amount), 0) AS total_expenses,
  p.total_cost - COALESCE(SUM(d.amount), 0) + COALESCE(SUM(e.amount), 0) AS amount_remaining
FROM 
  public.programs p
  LEFT JOIN public.donations d ON p.id = d.program_id
  LEFT JOIN public.expenses e ON p.id = e.program_id
WHERE 
  p.category = 'charity'
GROUP BY 
  p.id, p.title, p.total_cost;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Users table policies
CREATE POLICY "Users can view their own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

-- Programs table policies
CREATE POLICY "Anyone can view published programs" 
  ON public.programs FOR SELECT 
  USING (status = 'published' OR auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

CREATE POLICY "Only admins can insert programs" 
  ON public.programs FOR INSERT 
  WITH CHECK (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

CREATE POLICY "Only admins can update programs" 
  ON public.programs FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

CREATE POLICY "Only admins can delete programs" 
  ON public.programs FOR DELETE 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Program images policies
CREATE POLICY "Anyone can view images for published programs" 
  ON public.program_images FOR SELECT 
  USING (
    program_id IN (SELECT id FROM public.programs WHERE status = 'published')
    OR auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

CREATE POLICY "Only admins can manage program images" 
  ON public.program_images FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Donation categories policies
CREATE POLICY "Anyone can view donation categories for published programs" 
  ON public.donation_categories FOR SELECT 
  USING (
    program_id IN (SELECT id FROM public.programs WHERE status = 'published')
    OR auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

CREATE POLICY "Only admins can manage donation categories" 
  ON public.donation_categories FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Donations policies
CREATE POLICY "Anyone can view donations" 
  ON public.donations FOR SELECT 
  USING (TRUE);

CREATE POLICY "Anyone can create donations" 
  ON public.donations FOR INSERT 
  WITH CHECK (TRUE);

CREATE POLICY "Only admins can update donations" 
  ON public.donations FOR UPDATE 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

CREATE POLICY "Only admins can delete donations" 
  ON public.donations FOR DELETE 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- Expenses policies
CREATE POLICY "Anyone can view expenses" 
  ON public.expenses FOR SELECT 
  USING (TRUE);

CREATE POLICY "Only admins can manage expenses" 
  ON public.expenses FOR ALL 
  USING (auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE));

-- =====================================================
-- STORAGE BUCKETS SETUP (Run these in Supabase Dashboard)
-- =====================================================

-- Create storage buckets via SQL:
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('program-images', 'program-images', TRUE),
  ('expense-invoices', 'expense-invoices', TRUE)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for program-images bucket
CREATE POLICY "Public can view program images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'program-images');

CREATE POLICY "Admins can upload program images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'program-images' 
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

CREATE POLICY "Admins can delete program images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'program-images' 
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

-- Storage policies for expense-invoices bucket
CREATE POLICY "Public can view expense invoices"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'expense-invoices');

CREATE POLICY "Admins can upload expense invoices"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'expense-invoices' 
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

CREATE POLICY "Admins can delete expense invoices"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'expense-invoices' 
    AND auth.uid() IN (SELECT id FROM public.users WHERE is_admin = TRUE)
  );

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Note: To create an admin user:
-- 1. Sign up a user through Supabase Auth
-- 2. Get the user's UUID from auth.users
-- 3. Run: UPDATE public.users SET is_admin = TRUE WHERE id = 'your-user-uuid';
