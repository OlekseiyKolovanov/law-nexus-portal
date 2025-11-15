-- Fix search path for the update function  
DROP TRIGGER IF EXISTS update_criminal_proceedings_updated_at ON public.criminal_proceedings;
DROP FUNCTION IF EXISTS public.update_criminal_proceedings_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_criminal_proceedings_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_criminal_proceedings_updated_at
BEFORE UPDATE ON public.criminal_proceedings
FOR EACH ROW
EXECUTE FUNCTION public.update_criminal_proceedings_updated_at();