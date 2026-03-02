import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { supabase, apiFetch } from '../lib/supabase';
import type { Session, User } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  bio: string;
  location: string;
  photoUrl: string;
  coins: number;
  itemsShared: number;
  activitiesJoined: number;
  volunteerHours: number;
  createdAt: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error?: string }>;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ error?: string }>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (accessToken: string) => {
    try {
      const data = await apiFetch('/profile', {
        headers: { 'x-user-token': accessToken },
      });
      setProfile(data.profile);
    } catch (err: any) {
      // 401 is expected when not logged in or token expired — not a real error
      const msg = err?.message || '';
      if (msg.includes('401') || msg.includes('Unauthorized') || msg.includes('Invalid JWT')) {
        console.log('No valid session for profile fetch (expected when not logged in)');
        setProfile(null);
      } else {
        console.error('Error fetching profile:', err);
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token && s?.user) {
        fetchProfile(s.access_token).finally(() => {
          if (!cancelled) setLoading(false);
        });
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      if (cancelled) return;
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.access_token && s?.user) {
        fetchProfile(s.access_token);
      } else {
        setProfile(null);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const data = await apiFetch('/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, name }),
      });
      if (data.error) return { error: data.error };
      
      // Sign in after signup
      const { error: signInErr } = await supabase.auth.signInWithPassword({ email, password });
      if (signInErr) return { error: signInErr.message };
      return {};
    } catch (err: any) {
      return { error: err.message || 'Signup failed' };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { error: error.message };
      if (data.session?.access_token) {
        await fetchProfile(data.session.access_token);
      }
      return {};
    } catch (err: any) {
      return { error: err.message || 'Sign in failed' };
    }
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    setSession(null);
    setUser(null);
  };

  const refreshProfile = async () => {
    if (session?.access_token) {
      await fetchProfile(session.access_token);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    try {
      const data = await apiFetch('/profile', {
        method: 'PUT',
        body: JSON.stringify(updates),
      });
      if (data.profile) setProfile(data.profile);
      return {};
    } catch (err: any) {
      return { error: err.message || 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider value={{
      session, user, profile, loading,
      signUp, signIn, signOut, refreshProfile, updateProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}