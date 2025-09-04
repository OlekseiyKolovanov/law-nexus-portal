-- Add nickname field to profiles table for user registration
ALTER TABLE public.profiles ADD COLUMN nickname TEXT;

-- Create unique index for nicknames (case insensitive)
CREATE UNIQUE INDEX profiles_nickname_unique_idx ON public.profiles (LOWER(nickname));

-- Update profiles RLS policy to allow viewing nicknames publicly
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);