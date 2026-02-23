import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getProfile, updateProfile } from '@/services/profile';

export type Profile = {
  id: string;
  units: 'metric' | 'imperial';
  theme: 'light' | 'dark' | 'system';
  notify_push: boolean;
  notify_reminders: boolean;
  onboarding_completed: boolean;
  onboarding_version: number;
  disclaimer_version: number;
  disclaimer_accepted_at: string | null;
  glide_serum_recents: string[];
  plan: 'starter' | 'pro';
  plan_expires_at: string | null;
};

export type ProfileContextValue = {
  profile: Profile | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  update: (patch: Partial<Omit<Profile, 'id'>>) => Promise<void>;
};

export const ProfileContext = createContext<ProfileContextValue | null>(null);

export function ProfileProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      setError(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const next = await getProfile(user.id);
      setProfile(next);
      setLoading(false);
    } catch (e) {
      setProfile(null);
      setError(e instanceof Error ? e.message : 'Failed to load profile');
      setLoading(false);
    }
  }, [user]);

  const update = useCallback(
    async (patch: Partial<Omit<Profile, 'id'>>) => {
      if (!user) return;
      setError(null);
      try {
        const next = await updateProfile(user.id, patch);
        setProfile(next);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Failed to update profile');
      }
    },
    [user]
  );

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const value = useMemo<ProfileContextValue>(
    () => ({ profile, loading, error, refresh, update }),
    [profile, loading, error, refresh, update]
  );

  return <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>;
}

export function useProfile() {
  const ctx = useContext(ProfileContext);
  if (!ctx) throw new Error('useProfile must be used within ProfileProvider');
  return ctx;
}
