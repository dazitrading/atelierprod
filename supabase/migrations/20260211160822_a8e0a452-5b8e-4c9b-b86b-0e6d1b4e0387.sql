
-- Create production table
CREATE TABLE public.production (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id TEXT NOT NULL,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL CHECK (quantity > 0),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  color TEXT,
  detail TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.production ENABLE ROW LEVEL SECURITY;

-- Public access (no auth in this app)
CREATE POLICY "Anyone can read production" ON public.production FOR SELECT USING (true);
CREATE POLICY "Anyone can insert production" ON public.production FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update production" ON public.production FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Anyone can delete production" ON public.production FOR DELETE USING (true);
