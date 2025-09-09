/*
  # Система голосування для депутатів

  1. Нові таблиці
    - `votings` - голосування за законопроекти
      - `id` (uuid, primary key)
      - `title` (text) - заголовок закону
      - `law_link` (text) - посилання на закон
      - `additional_info` (text) - додаткова інформація
      - `is_active` (boolean) - чи активне голосування
      - `created_at`, `updated_at` (timestamp)
    
    - `votes` - голоси депутатів
      - `id` (uuid, primary key)
      - `voting_id` (uuid) - посилання на голосування
      - `user_id` (uuid) - депутат що голосує
      - `vote_type` (enum) - ЗА/ПРОТИ/УТРИМАВСЯ
      - `created_at` (timestamp)

  2. Оновлення ролей
    - Додано роль `deputy` для депутатів

  3. Безпека
    - RLS для всіх таблиць
    - Депутати можуть голосувати
    - Адміни керують голосуваннями
    - Всі можуть переглядати результати
*/

-- Update app_role enum to include deputy
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'deputy';

-- Create vote_type enum
CREATE TYPE public.vote_type AS ENUM ('for', 'against', 'abstain');

-- Create votings table
CREATE TABLE IF NOT EXISTS public.votings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  law_link text NOT NULL,
  additional_info text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS public.votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  voting_id uuid NOT NULL REFERENCES public.votings(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  vote_type public.vote_type NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(voting_id, user_id)
);

-- Enable RLS
ALTER TABLE public.votings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- RLS policies for votings
CREATE POLICY "Everyone can view votings" 
ON public.votings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage votings" 
ON public.votings 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- RLS policies for votes
CREATE POLICY "Everyone can view votes" 
ON public.votes 
FOR SELECT 
USING (true);

CREATE POLICY "Deputies can vote" 
ON public.votes 
FOR INSERT 
WITH CHECK (
  public.has_role(auth.uid(), 'deputy') AND 
  auth.uid() = user_id
);

CREATE POLICY "Deputies can update their votes" 
ON public.votes 
FOR UPDATE 
USING (
  public.has_role(auth.uid(), 'deputy') AND 
  auth.uid() = user_id
);

CREATE POLICY "Admins can manage all votes" 
ON public.votes 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Create triggers for updated_at
CREATE TRIGGER update_votings_updated_at
BEFORE UPDATE ON public.votings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();