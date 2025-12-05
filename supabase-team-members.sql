-- Add team members table to existing schema
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS public.team_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    year VARCHAR(10) NOT NULL, -- e.g., "2025/26"
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.team_members ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Anyone can view team members"
    ON public.team_members FOR SELECT
    USING (true);

-- Admin write access (insert, update, delete)
CREATE POLICY "Admins can manage team members"
    ON public.team_members FOR ALL
    USING (
        auth.uid() IN (
            SELECT id FROM public.users WHERE is_admin = TRUE
        )
    );

-- Create index for better performance
CREATE INDEX idx_team_members_year ON public.team_members(year);
CREATE INDEX idx_team_members_display_order ON public.team_members(display_order);

-- Add Senior Treasurer as a special position (optional - can be added via admin panel)
-- INSERT INTO public.team_members (name, position, display_order, year) 
-- VALUES ('Senior Treasurer Name', 'Senior Treasurer', 0, '2025/26');
