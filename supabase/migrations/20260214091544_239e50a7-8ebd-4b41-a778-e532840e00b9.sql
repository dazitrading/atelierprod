
-- Create stock movements table
CREATE TABLE public.stock (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  workshop_id TEXT NOT NULL,
  color TEXT,
  size TEXT,
  quantity INTEGER NOT NULL,
  movement_type TEXT NOT NULL DEFAULT 'in' CHECK (movement_type IN ('in', 'out')),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  note TEXT,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.stock ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can read own stock" ON public.stock FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own stock" ON public.stock FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own stock" ON public.stock FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own stock" ON public.stock FOR DELETE USING (auth.uid() = user_id);
