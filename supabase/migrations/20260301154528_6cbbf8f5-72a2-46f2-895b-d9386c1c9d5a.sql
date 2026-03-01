CREATE TABLE public.fournitures (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  workshop_id TEXT NOT NULL,
  article TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  user_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.fournitures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own fournitures" ON public.fournitures FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fournitures" ON public.fournitures FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own fournitures" ON public.fournitures FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own fournitures" ON public.fournitures FOR DELETE USING (auth.uid() = user_id);