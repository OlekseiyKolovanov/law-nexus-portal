-- Create president biography table
CREATE TABLE public.president_biography (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  position text NOT NULL DEFAULT 'Президент',
  bio text NOT NULL,
  photo_url text,
  birth_date date,
  education text,
  achievements text,
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.president_biography ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view president biography" 
ON public.president_biography 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage president biography" 
ON public.president_biography 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create criminal proceedings table for ЄРДР
CREATE TABLE public.criminal_proceedings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_full_name text NOT NULL,
  initiating_structure text NOT NULL,
  suspect_full_name text NOT NULL,
  incriminating_article text NOT NULL,
  circumstances_description text NOT NULL,
  crime_date date NOT NULL,
  status text NOT NULL DEFAULT 'на розгляді',
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

ALTER TABLE public.criminal_proceedings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view criminal proceedings" 
ON public.criminal_proceedings 
FOR SELECT 
USING (true);

CREATE POLICY "Authenticated users can create proceedings" 
ON public.criminal_proceedings 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Prosecutors can manage all proceedings" 
ON public.criminal_proceedings 
FOR ALL 
USING (has_role(auth.uid(), 'prosecutor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Create documents table for criminal proceedings (for Google Docs links)
CREATE TABLE public.proceeding_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  proceeding_id uuid REFERENCES public.criminal_proceedings(id) ON DELETE CASCADE NOT NULL,
  document_name text NOT NULL,
  document_link text NOT NULL,
  order_index integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE public.proceeding_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view proceeding documents" 
ON public.proceeding_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Document creators can add documents" 
ON public.proceeding_documents 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.criminal_proceedings 
    WHERE id = proceeding_id AND user_id = auth.uid()
  )
);

CREATE POLICY "Prosecutors can manage all documents" 
ON public.proceeding_documents 
FOR ALL 
USING (has_role(auth.uid(), 'prosecutor'::app_role) OR has_role(auth.uid(), 'admin'::app_role));

-- Add trigger for updated_at on criminal_proceedings
CREATE OR REPLACE FUNCTION public.update_criminal_proceedings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_criminal_proceedings_updated_at
BEFORE UPDATE ON public.criminal_proceedings
FOR EACH ROW
EXECUTE FUNCTION public.update_criminal_proceedings_updated_at();