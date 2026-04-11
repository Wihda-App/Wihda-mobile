import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import {
  apiFetch,
  getStoredToken,
  setTokens,
  setRestrictedToken,
  clearTokens,
  ApiError,
} from '../lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  bio: string;
  location: string;
  neighborhood: { id: string; name: string; city: string } | null;
  photoUrl: string;
  coins: number;
  role: string;
  verificationStatus: string;
  onboardingCompleted: boolean;
  createdAt: string;
}

export interface AuthContextType {
  user: UserProfile | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (
    email: string,
    password: string,
    name: string
  ) => Promise<{
    error?: string;
    verificationSessionId?: string;
    restrictedToken?: string;
    contactChannel?: string;
  }>;
  signIn: (
    email: string,
    password: string
  ) => Promise<{
    error?: string;
    code?: string;
    restrictedToken?: string;
    contactChannel?: string;
    onboardingCompleted?: boolean;
  }>;
  signOut: () => void;
  refreshProfile: () => Promise<UserProfile | null>;
  updateProfile: (updates: { name?: string; language?: string; bio?: string }) => Promise<{ error?: string }>;
}

// ─── Context ───────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextType | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (): Promise<UserProfile | null> => {
    try {
      const data = await apiFetch('/v1/me');
      if (data.success && data.data) {
        const d = data.data;
        const p: UserProfile = {
          id: d.id,
          name: d.display_name,
          email: d.email ?? null,
          phone: d.phone ?? null,
          bio: d.bio ?? '',
          location: d.neighborhood
            ? `${d.neighborhood.name}, ${d.neighborhood.city}`
            : '',
          neighborhood: d.neighborhood ?? null,
          photoUrl: d.photo_url ?? '',
          coins: d.coin_balance ?? 0,
          role: d.role,
          verificationStatus: d.verification_status,
          onboardingCompleted: d.onboarding_completed ?? false,
          createdAt: d.created_at,
        };
        setUser(p);
        setProfile(p);
        return p;
      }
      return null;
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) {
        setUser(null);
        setProfile(null);
      } else {
        console.error('Error fetching profile:', err);
      }
      return null;
    }
  }, []);

  // Rehydrate session on load
  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchProfile().finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchProfile]);

  // ─── signUp ──────────────────────────────────────────────────────────────────

  const signUp = async (email: string, password: string, name: string) => {
    try {
      const data = await apiFetch('/v1/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, display_name: name }),
      });

      if (data.success) {
        const { restricted_token, verification_session_id, contact_channel } = data.data;
        // Store restricted token so OTP routes can use it
        setRestrictedToken(restricted_token);
        return {
          verificationSessionId: verification_session_id,
          restrictedToken: restricted_token,
          contactChannel: contact_channel,
        };
      }
      return { error: 'Signup failed' };
    } catch (err) {
      if (err instanceof ApiError) {
        return { error: err.message };
      }
      return { error: 'Signup failed' };
    }
  };

  // ─── signIn ──────────────────────────────────────────────────────────────────

  const signIn = async (email: string, password: string) => {
    try {
      const data = await apiFetch('/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });

      if (data.success) {
        const { access_token, refresh_token } = data.data;
        setTokens(access_token, refresh_token);
        const p = await fetchProfile();
        return { onboardingCompleted: p?.onboardingCompleted ?? true };
      }
      return { error: 'Login failed' };
    } catch (err) {
      if (err instanceof ApiError) {
        const errData = err.data as any;
        const details = errData?.error?.details ?? {};

        if (err.code === 'CONTACT_VERIFICATION_REQUIRED') {
          // Store the restricted token so the OTP page can send/confirm
          if (details.restricted_token) {
            setRestrictedToken(details.restricted_token);
          }
          return {
            error: 'Please verify your contact before logging in.',
            code: 'CONTACT_VERIFICATION_REQUIRED',
            restrictedToken: details.restricted_token,
            contactChannel: details.contact_channel,
          };
        }

        return { error: err.message };
      }
      return { error: 'Sign in failed' };
    }
  };

  // ─── signOut ─────────────────────────────────────────────────────────────────

  const signOut = () => {
    clearTokens();
    setUser(null);
    setProfile(null);
  };

  // ─── refreshProfile ──────────────────────────────────────────────────────────

  const refreshProfile = async (): Promise<UserProfile | null> => {
    if (getStoredToken()) {
      return fetchProfile();
    }
    return null;
  };

  // ─── updateProfile ───────────────────────────────────────────────────────────

  const updateProfile = async (updates: { name?: string; language?: string; bio?: string }) => {
    try {
      const body: Record<string, string> = {};
      if (updates.name) body.display_name = updates.name;
      if (updates.language) body.language_preference = updates.language;
      if (updates.bio !== undefined) body.bio = updates.bio;

      const data = await apiFetch('/v1/me', {
        method: 'PATCH',
        body: JSON.stringify(body),
      });

      if (data.success) {
        await fetchProfile();
        return {};
      }
      return { error: 'Update failed' };
    } catch (err) {
      if (err instanceof ApiError) return { error: err.message };
      return { error: 'Update failed' };
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        signUp,
        signIn,
        signOut,
        refreshProfile,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
