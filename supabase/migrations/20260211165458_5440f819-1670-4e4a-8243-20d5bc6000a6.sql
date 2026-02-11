
-- Add user_id column to articles
ALTER TABLE public.articles ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Add user_id column to production
ALTER TABLE public.production ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Drop existing RLS policies on articles
DROP POLICY IF EXISTS "Anyone can delete articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can insert articles" ON public.articles;
DROP POLICY IF EXISTS "Anyone can read articles" ON public.articles;

-- Drop existing RLS policies on production
DROP POLICY IF EXISTS "Anyone can delete production" ON public.production;
DROP POLICY IF EXISTS "Anyone can insert production" ON public.production;
DROP POLICY IF EXISTS "Anyone can read production" ON public.production;
DROP POLICY IF EXISTS "Anyone can update production" ON public.production;

-- Create per-user RLS policies on articles
CREATE POLICY "Users can read own articles" ON public.articles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own articles" ON public.articles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE USING (auth.uid() = user_id);

-- Create per-user RLS policies on production
CREATE POLICY "Users can read own production" ON public.production FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own production" ON public.production FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own production" ON public.production FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own production" ON public.production FOR DELETE USING (auth.uid() = user_id);
