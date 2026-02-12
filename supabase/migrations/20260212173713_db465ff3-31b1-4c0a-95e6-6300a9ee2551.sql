
-- Drop all restrictive policies and recreate as permissive

-- Articles table
DROP POLICY IF EXISTS "Users can read own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can insert own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;

CREATE POLICY "Users can read own articles" ON public.articles FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own articles" ON public.articles FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own articles" ON public.articles FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own articles" ON public.articles FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Production table
DROP POLICY IF EXISTS "Users can read own production" ON public.production;
DROP POLICY IF EXISTS "Users can insert own production" ON public.production;
DROP POLICY IF EXISTS "Users can update own production" ON public.production;
DROP POLICY IF EXISTS "Users can delete own production" ON public.production;

CREATE POLICY "Users can read own production" ON public.production FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own production" ON public.production FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own production" ON public.production FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own production" ON public.production FOR DELETE TO authenticated USING (auth.uid() = user_id);
