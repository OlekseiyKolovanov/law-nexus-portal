-- Create user roles enum
CREATE TYPE public.app_role as enum ('admin', 'license_manager', 'law_manager');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create statistics table
CREATE TABLE public.statistics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  laws_count integer NOT NULL DEFAULT 0,
  school_topics_count integer NOT NULL DEFAULT 0,
  active_tenders_count integer NOT NULL DEFAULT 0,
  staff_count integer NOT NULL DEFAULT 0,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert initial statistics
INSERT INTO public.statistics (laws_count, school_topics_count, active_tenders_count, staff_count) 
VALUES (0, 0, 0, 0);

-- Enable RLS on statistics
ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

-- Create leadership table
CREATE TABLE public.leadership (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  position text NOT NULL,
  photo_url text,
  bio text,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on leadership
ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

-- Create laws table
CREATE TABLE public.laws (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  link text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on laws
ALTER TABLE public.laws ENABLE ROW LEVEL SECURITY;

-- Create legal_school table
CREATE TABLE public.legal_school (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text,
  link text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on legal_school
ALTER TABLE public.legal_school ENABLE ROW LEVEL SECURITY;

-- Create tenders table
CREATE TABLE public.tenders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  content text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  has_form boolean NOT NULL DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tenders
ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

-- Create tender_form_questions table
CREATE TABLE public.tender_form_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  question text NOT NULL,
  question_type text NOT NULL DEFAULT 'text', -- text, select, checkbox, radio
  options text[], -- for select/radio/checkbox
  is_required boolean NOT NULL DEFAULT false,
  order_index integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tender_form_questions
ALTER TABLE public.tender_form_questions ENABLE ROW LEVEL SECURITY;

-- Create tender_form_responses table
CREATE TABLE public.tender_form_responses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id uuid NOT NULL REFERENCES public.tenders(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  responses jsonb NOT NULL,
  submitted_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on tender_form_responses
ALTER TABLE public.tender_form_responses ENABLE ROW LEVEL SECURITY;

-- Create lawyers_registry table
CREATE TABLE public.lawyers_registry (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  license_number text NOT NULL,
  specialization text,
  contact_info text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on lawyers_registry
ALTER TABLE public.lawyers_registry ENABLE ROW LEVEL SECURITY;

-- Create enterprises table
CREATE TABLE public.enterprises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  owner_name text NOT NULL,
  business_type text NOT NULL, -- FOP, TOV, BO
  registration_number text,
  contact_info text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on enterprises
ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for public viewing
CREATE POLICY "Everyone can view statistics" ON public.statistics FOR SELECT USING (true);
CREATE POLICY "Everyone can view leadership" ON public.leadership FOR SELECT USING (true);
CREATE POLICY "Everyone can view laws" ON public.laws FOR SELECT USING (true);
CREATE POLICY "Everyone can view legal school" ON public.legal_school FOR SELECT USING (true);
CREATE POLICY "Everyone can view active tenders" ON public.tenders FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view tender form questions" ON public.tender_form_questions FOR SELECT USING (true);
CREATE POLICY "Everyone can view lawyers registry" ON public.lawyers_registry FOR SELECT USING (is_active = true);
CREATE POLICY "Everyone can view enterprises" ON public.enterprises FOR SELECT USING (is_active = true);

-- Create admin policies
CREATE POLICY "Admins can manage statistics" ON public.statistics 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage leadership" ON public.leadership 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage laws" ON public.laws 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage legal school" ON public.legal_school 
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'law_manager'));

CREATE POLICY "Admins can manage tenders" ON public.tenders 
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'license_manager'));

CREATE POLICY "Admins can manage tender questions" ON public.tender_form_questions 
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'license_manager'));

CREATE POLICY "Admins can view tender responses" ON public.tender_form_responses 
FOR SELECT USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'license_manager'));

CREATE POLICY "Admins can manage lawyers registry" ON public.lawyers_registry 
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'law_manager'));

CREATE POLICY "Admins can manage enterprises" ON public.enterprises 
FOR ALL USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'license_manager'));

-- Allow users to submit tender responses
CREATE POLICY "Users can submit tender responses" ON public.tender_form_responses 
FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own responses" ON public.tender_form_responses 
FOR SELECT USING (auth.uid() = user_id);

-- Create triggers for updated_at
CREATE TRIGGER update_leadership_updated_at
BEFORE UPDATE ON public.leadership
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_laws_updated_at
BEFORE UPDATE ON public.laws
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_legal_school_updated_at
BEFORE UPDATE ON public.legal_school
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_tenders_updated_at
BEFORE UPDATE ON public.tenders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_lawyers_registry_updated_at
BEFORE UPDATE ON public.lawyers_registry
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_enterprises_updated_at
BEFORE UPDATE ON public.enterprises
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert the admin user role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users
WHERE email = 'olekseikolovanov@gmail.com'
ON CONFLICT DO NOTHING;