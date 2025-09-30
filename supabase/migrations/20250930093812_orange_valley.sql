/*
  # Complete Voting System for Deputies

  1. New Tables
    - `votings` - voting sessions for laws
      - `id` (uuid, primary key)
      - `title` (text) - law title
      - `law_link` (text) - link to the law
      - `additional_info` (text) - additional information
      - `is_active` (boolean) - whether voting is active
      - `created_at`, `updated_at` (timestamp)
    
    - `votes` - deputy votes
      - `id` (uuid, primary key)
      - `voting_id` (uuid) - reference to voting
      - `user_id` (uuid) - deputy who votes
      - `vote_type` (enum) - FOR/AGAINST/ABSTAIN
      - `created_at` (timestamp)

  2. Role Updates
    - Add `deputy` role for deputies who can vote

  3. Security
    - RLS for all tables
    - Deputies can vote
    - Admins manage votings
    - Everyone can view results
*/

-- Update app_role enum to include deputy
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'license_manager', 'law_manager');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_enum e 
    JOIN pg_type t ON e.enumtypid = t.oid 
    WHERE t.typname = 'app_role' AND e.enumlabel = 'deputy'
  ) THEN
    ALTER TYPE public.app_role ADD VALUE 'deputy';
  END IF;
END $$;

-- Create vote_type enum
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'vote_type') THEN
    CREATE TYPE public.vote_type AS ENUM ('for', 'against', 'abstain');
  END IF;
END $$;

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

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Everyone can view votings" ON public.votings;
DROP POLICY IF EXISTS "Admins can manage votings" ON public.votings;
DROP POLICY IF EXISTS "Everyone can view votes" ON public.votes;
DROP POLICY IF EXISTS "Deputies can vote" ON public.votes;
DROP POLICY IF EXISTS "Deputies can update their votes" ON public.votes;
DROP POLICY IF EXISTS "Admins can manage all votes" ON public.votes;

-- RLS policies for votings
CREATE POLICY "Everyone can view votings" 
ON public.votings 
FOR SELECT 
USING (true);

CREATE POLICY "Admins can manage votings" 
ON public.votings 
FOR ALL 
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- RLS policies for votes
CREATE POLICY "Everyone can view votes" 
ON public.votes 
FOR SELECT 
USING (true);

CREATE POLICY "Deputies can vote" 
ON public.votes 
FOR INSERT 
WITH CHECK (
  public.has_role('deputy'::public.app_role, auth.uid()) AND 
  auth.uid() = user_id
);

CREATE POLICY "Deputies can update their votes" 
ON public.votes 
FOR UPDATE 
USING (
  public.has_role('deputy'::public.app_role, auth.uid()) AND 
  auth.uid() = user_id
);

CREATE POLICY "Admins can manage all votes" 
ON public.votes 
FOR ALL 
USING (public.has_role('admin'::public.app_role, auth.uid()));

-- Create trigger for updated_at on votings
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_votings_updated_at ON public.votings;
CREATE TRIGGER update_votings_updated_at
BEFORE UPDATE ON public.votings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();