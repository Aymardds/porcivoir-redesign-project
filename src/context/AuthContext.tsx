import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export type UserRole = 'customer' | 'admin' | 'editor' | 'stock_manager' | 'seo' | 'commercial';

export interface UserProfile {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  /** Primary role (legacy, kept for backward-compat) */
  role: UserRole;
  /** Multi-role array — always populated, at minimum contains [role] */
  roles: UserRole[];
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signOut: () => Promise<void>;
  /** Refetch current user profile on demand */
  refreshProfile: () => Promise<void>;
  /** Returns true if the current user has ANY of the provided roles */
  hasRole: (...roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {},
  refreshProfile: async () => {},
  hasRole: () => false,
});

/** Normalise a raw DB profile into a UserProfile with a guaranteed roles[] array */
function normaliseProfile(data: any): UserProfile {
  const primaryRole: UserRole = data.role ?? 'customer';
  // roles column may not exist yet (pre-migration) — fall back gracefully
  const rawRoles: UserRole[] = Array.isArray(data.roles) ? data.roles : [];
  const roles = rawRoles.length > 0 ? rawRoles : [primaryRole];
  return { ...data, role: primaryRole, roles };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      setProfile(normaliseProfile(data));
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    if (user?.id) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Synchronisation en temps réel du profil et des rôles
  useEffect(() => {
    if (!user?.id) return;

    const channel = supabase
      .channel(`profile-realtime-sync-${user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        (payload) => {
          if (payload.new) {
            setProfile(normaliseProfile(payload.new));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const hasRole = (...roles: UserRole[]) => {
    if (!profile) return false;
    return profile.roles.some((r) => roles.includes(r));
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshProfile, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
