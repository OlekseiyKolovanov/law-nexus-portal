-- Add RLS policies for user_roles table
CREATE POLICY "Admins can view all user roles" ON public.user_roles 
FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage user roles" ON public.user_roles 
FOR ALL USING (public.has_role(auth.uid(), 'admin'));