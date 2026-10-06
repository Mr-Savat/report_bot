-- ========================================================
-- Cambo BIM Site Report Database Schema (Supabase / PostgreSQL)
-- ========================================================

-- 1. Create table for Users / Engineers
CREATE TABLE IF NOT EXISTS public.app_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT UNIQUE NOT NULL,
    username TEXT,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'engineer' CHECK (role IN ('admin', 'engineer', 'viewer')),
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
    approved_by TEXT,
    approved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create table for Assigned Tasks / Projects
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    category TEXT DEFAULT 'Construction',
    status TEXT DEFAULT 'in_progress',
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create table for Construction Daily Site Reports
CREATE TABLE IF NOT EXISTS public.daily_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_user_id BIGINT NOT NULL,
    telegram_username TEXT,
    reporter_name TEXT NOT NULL,
    assigned_task TEXT NOT NULL,
    report_date DATE NOT NULL,
    weather TEXT NOT NULL,
    start_time TEXT NOT NULL,
    work_summary TEXT NOT NULL,
    quality_and_safety TEXT,
    issues_and_obstacles TEXT,
    tomorrows_plan TEXT,
    status TEXT DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'approved', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Insert Initial Sample Tasks
INSERT INTO public.tasks (code, title, category) 
VALUES 
    ('TSK-SAMPLE-09-1', 'SAMPLE - Mobilization & site setup', 'Civil & BIM'),
    ('TSK-STRUCT-01', 'Structural Framing & Rebar Inspection', 'Structural'),
    ('TSK-MEP-03', 'HVAC & MEP Pipe Installation Level 2', 'MEP'),
    ('TSK-FINISH-08', 'Plastering & Tile Works Block B', 'Finishing')
ON CONFLICT (code) DO NOTHING;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.app_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_reports ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies (Allow read/insert for service role or authenticated app)
CREATE POLICY "Allow public read tasks" ON public.tasks FOR SELECT USING (true);
CREATE POLICY "Allow anon insert reports" ON public.daily_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow anon read reports" ON public.daily_reports FOR SELECT USING (true);
