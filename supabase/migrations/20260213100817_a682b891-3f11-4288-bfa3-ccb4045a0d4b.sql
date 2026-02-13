
-- Add workshop_id column to articles table
ALTER TABLE public.articles ADD COLUMN workshop_id text;

-- Update existing articles to have a default workshop_id (first workshop)
UPDATE public.articles SET workshop_id = 'atelier-1' WHERE workshop_id IS NULL;

-- Make workshop_id NOT NULL after setting defaults
ALTER TABLE public.articles ALTER COLUMN workshop_id SET NOT NULL;
