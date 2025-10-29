import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type UserRole = 'admin' | 'profissional' | 'cliente' | null;

export function useUserRole() {
  const [role, setRole] = useState<UserRole>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setRole(null);
        setLoading(false);
        return;
      }

      const { data: roles } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .order('role');

      if (roles && roles.length > 0) {
        // Se o usuário tem múltiplos roles, prioriza admin
        const hasAdmin = roles.some(r => r.role === 'admin');
        setRole(hasAdmin ? 'admin' : roles[0].role as UserRole);
      } else {
        setRole(null);
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  return { role, loading, isAdmin: role === 'admin', isProfissional: role === 'profissional', isCliente: role === 'cliente' };
}
