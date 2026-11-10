import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import type { Profile } from '@/lib/types';

interface ProfileRow {
  id: string;
  name: string;
  email: string;
  is_premium: boolean;
  premium_since: string | null;
  created_at: string;
}

function mapProfile(r: ProfileRow): Profile {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    isPremium: r.is_premium,
    premiumSince: r.premium_since,
    createdAt: r.created_at,
  };
}

export function useAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [profileError, setProfileError] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, email, is_premium, premium_since, created_at')
      .eq('id', userId)
      .maybeSingle();
    if (error || !data) {
      setProfile(null);
      setProfileError(true);
      return;
    }
    setProfileError(false);
    setProfile(mapProfile(data as ProfileRow));
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      (async () => {
        setSession(nextSession);
        if (nextSession) {
          await loadProfile(nextSession.user.id);
        } else {
          setProfile(null);
          setProfileError(false);
        }
        setLoading(false);
      })();
    });
    return () => sub.subscription.unsubscribe();
  }, [loadProfile]);

  const signUp = useCallback(async (name: string, email: string, password: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });
    if (error) throw error;
    if (!data.session) throw new Error('CONFIRMATION_REQUIRED');
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  }, []);

  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  }, []);

  const updateName = useCallback(
    async (name: string) => {
      if (!session) throw new Error('NOT_AUTHENTICATED');
      const { error } = await supabase.from('profiles').update({ name }).eq('id', session.user.id);
      if (error) throw error;
      await loadProfile(session.user.id);
    },
    [session, loadProfile]
  );

  const activatePremium = useCallback(async () => {
    if (!session) throw new Error('NOT_AUTHENTICATED');
    const { error } = await supabase.rpc('activate_premium');
    if (error) throw error;
    await loadProfile(session.user.id);
  }, [session, loadProfile]);

  const retryProfile = useCallback(async () => {
    if (session) await loadProfile(session.user.id);
  }, [session, loadProfile]);

  return {
    session,
    userId: session?.user.id ?? null,
    profile,
    profileError,
    loading,
    signUp,
    signIn,
    signOut,
    updateName,
    activatePremium,
    retryProfile,
  };
}
