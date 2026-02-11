-- Fix: Drop restrictive policies and recreate as permissive
DROP POLICY IF EXISTS "Users can insert own production" ON public.production;
DROP POLICY IF EXISTS "Users can read own production" ON public.production;
DROP POLICY IF EXISTS "Users can update own production" ON public.production;
DROP POLICY IF EXISTS "Users can delete own production" ON public.production;

CREATE POLICY "Users can insert own production"
ON public.production FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own production"
ON public.production FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own production"
ON public.production FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own production"
ON public.production FOR DELETE
USING (auth.uid() = user_id);

-- Also fix articles table policies
DROP POLICY IF EXISTS "Users can insert own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can read own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can update own articles" ON public.articles;
DROP POLICY IF EXISTS "Users can delete own articles" ON public.articles;

CREATE POLICY "Users can insert own articles"
ON public.articles FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own articles"
ON public.articles FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own articles"
ON public.articles FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own articles"
ON public.articles FOR DELETE
USING (auth.uid() = user_id);