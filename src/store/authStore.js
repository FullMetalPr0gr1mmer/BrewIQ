import { create } from 'zustand';
import { supabase } from '../lib/supabase';

let listenerRegistered = false;

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) {
      console.warn('Profile fetch error:', error.message);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

const useAuthStore = create((set) => ({
  user: null,
  profile: null,
  loading: true,

  initialize: async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        set({ user: session.user, profile, loading: false });
      } else {
        set({ loading: false });
      }
    } catch {
      set({ loading: false });
    }

    // Only register listener once (React StrictMode calls effects twice)
    if (!listenerRegistered) {
      listenerRegistered = true;
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id);
          set({ user: session.user, profile });
        } else {
          set({ user: null, profile: null });
        }
      });
    }
  },

  signUp: async (email, password, fullName, role = 'user') => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role }
      }
    });
    if (error) throw error;
    return data;
  },

  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email, password
    });
    if (error) throw error;
    return data;
  },

  signOut: async () => {
    await supabase.auth.signOut();
    set({ user: null, profile: null });
  }
}));

export default useAuthStore;
