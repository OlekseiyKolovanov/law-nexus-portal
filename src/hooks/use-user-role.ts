import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './use-auth';

type UserRole = 'admin' | 'license_manager' | 'law_manager' | 'deputy' | 'prosecutor' | 'aau_manager';

export const useUserRole = () => {
  const { user } = useAuth();
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRoles([]);
      setLoading(false);
      return;
    }

    const fetchUserRoles = async () => {
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (error) {
          console.error('Error fetching user roles:', error);
          setRoles([]);
        } else {
          setRoles(data.map(r => r.role as UserRole));
        }
      } catch (error) {
        console.error('Error fetching user roles:', error);
        setRoles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRoles();
  }, [user]);

  const hasRole = (role: UserRole) => roles.includes(role);
  const isAdmin = () => hasRole('admin');
  const isDeputy = () => hasRole('deputy');
  const isProsecutor = () => hasRole('prosecutor');
  const canManageTenders = () => hasRole('admin') || hasRole('license_manager');
  const canManageLegal = () => hasRole('admin') || hasRole('law_manager');
  const canManageAAU = () => hasRole('admin') || hasRole('aau_manager');

  return {
    roles,
    loading,
    hasRole,
    isAdmin,
    isDeputy,
    isProsecutor,
    canManageTenders,
    canManageLegal,
    canManageAAU,
  };
};