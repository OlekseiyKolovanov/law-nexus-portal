-- Створення enum для ролей користувачів
CREATE TYPE public.app_role AS ENUM ('admin', 'license_manager', 'law_manager', 'deputy');

-- Створення enum для типів голосування
CREATE TYPE public.vote_type AS ENUM ('for', 'against', 'abstain');

-- Таблиця профілів користувачів
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT,
  first_name TEXT,
  last_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Функція для автоматичного створення профілю при реєстрації
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nickname, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'nickname',
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Таблиця ролей користувачів
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'
  ));

-- Функція перевірки ролі
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- Таблиця керівництва
CREATE TABLE public.leadership (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  position TEXT NOT NULL,
  photo_url TEXT,
  bio TEXT,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.leadership ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view leadership"
  ON public.leadership FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage leadership"
  ON public.leadership FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Таблиця законів
CREATE TABLE public.laws (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.laws ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view laws"
  ON public.laws FOR SELECT
  USING (true);

CREATE POLICY "Law managers can manage laws"
  ON public.laws FOR ALL
  USING (public.has_role(auth.uid(), 'law_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця юридичної школи
CREATE TABLE public.legal_school (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  link TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.legal_school ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view legal school topics"
  ON public.legal_school FOR SELECT
  USING (true);

CREATE POLICY "Law managers can manage legal school"
  ON public.legal_school FOR ALL
  USING (public.has_role(auth.uid(), 'law_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця реєстру адвокатів
CREATE TABLE public.lawyers_registry (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  license_number TEXT NOT NULL UNIQUE,
  specialization TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.lawyers_registry ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active lawyers"
  ON public.lawyers_registry FOR SELECT
  USING (is_active = true);

CREATE POLICY "License managers can manage lawyers"
  ON public.lawyers_registry FOR ALL
  USING (public.has_role(auth.uid(), 'license_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця підприємств
CREATE TABLE public.enterprises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  business_type TEXT,
  owner_name TEXT,
  registration_number TEXT,
  contact_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.enterprises ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active enterprises"
  ON public.enterprises FOR SELECT
  USING (is_active = true);

CREATE POLICY "License managers can manage enterprises"
  ON public.enterprises FOR ALL
  USING (public.has_role(auth.uid(), 'license_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця тендерів
CREATE TABLE public.tenders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  has_form BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.tenders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active tenders"
  ON public.tenders FOR SELECT
  USING (is_active = true);

CREATE POLICY "License managers can manage tenders"
  ON public.tenders FOR ALL
  USING (public.has_role(auth.uid(), 'license_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця питань форм тендерів
CREATE TABLE public.tender_form_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NOT NULL,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL,
  is_required BOOLEAN DEFAULT true,
  order_index INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.tender_form_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view tender questions"
  ON public.tender_form_questions FOR SELECT
  USING (true);

CREATE POLICY "License managers can manage tender questions"
  ON public.tender_form_questions FOR ALL
  USING (public.has_role(auth.uid(), 'license_manager') OR public.has_role(auth.uid(), 'admin'));

-- Таблиця відповідей на форми тендерів
CREATE TABLE public.tender_form_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tender_id UUID REFERENCES public.tenders(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.tender_form_questions(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  response_text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.tender_form_responses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own responses"
  ON public.tender_form_responses FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create responses"
  ON public.tender_form_responses FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all responses"
  ON public.tender_form_responses FOR SELECT
  USING (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'license_manager'));

-- Таблиця голосувань
CREATE TABLE public.votings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  link TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.votings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active votings"
  ON public.votings FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage votings"
  ON public.votings FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Таблиця голосів
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  voting_id UUID REFERENCES public.votings(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  vote vote_type NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(voting_id, user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Deputies can view all votes"
  ON public.votes FOR SELECT
  USING (public.has_role(auth.uid(), 'deputy') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Deputies can cast votes"
  ON public.votes FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'deputy') AND auth.uid() = user_id);

CREATE POLICY "Deputies can update their votes"
  ON public.votes FOR UPDATE
  USING (public.has_role(auth.uid(), 'deputy') AND auth.uid() = user_id);

-- Таблиця зворотного зв'язку
CREATE TABLE public.feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit feedback"
  ON public.feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view feedback"
  ON public.feedback FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

-- Таблиця статистики
CREATE TABLE public.statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  laws_count INTEGER DEFAULT 0,
  school_topics_count INTEGER DEFAULT 0,
  active_tenders_count INTEGER DEFAULT 0,
  staff_count INTEGER DEFAULT 0,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

ALTER TABLE public.statistics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view statistics"
  ON public.statistics FOR SELECT
  USING (true);

CREATE POLICY "Admins can update statistics"
  ON public.statistics FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

-- Вставка початкового рядка статистики
INSERT INTO public.statistics (laws_count, school_topics_count, active_tenders_count, staff_count) 
VALUES (0, 0, 0, 0);