-- Profiles: allow admins to view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (public.has_role(auth.uid(), 'admin'));

-- Profiles: allow users to insert their own profile
CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Votings: allow law managers to manage votings
CREATE POLICY "Law managers can manage votings"
ON public.votings
FOR ALL
USING (public.has_role(auth.uid(), 'law_manager') OR public.has_role(auth.uid(), 'admin'));

-- Lawyers registry: allow AAU managers to manage lawyers
CREATE POLICY "AAU managers can manage lawyers"
ON public.lawyers_registry
FOR ALL
USING (public.has_role(auth.uid(), 'aau_manager') OR public.has_role(auth.uid(), 'admin'));

-- Legal school: allow AAU managers to manage legal school
CREATE POLICY "AAU managers can manage legal school"
ON public.legal_school
FOR ALL
USING (public.has_role(auth.uid(), 'aau_manager') OR public.has_role(auth.uid(), 'admin'));