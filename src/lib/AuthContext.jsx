import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabase';

const AuthContext = createContext({
  user: null,
  session: null,
  loading: true,
  showAuthModal: false,
  openAuthModal: () => {},
  closeAuthModal: () => {},
  /** Require auth — opens modal if not logged in. Returns true if already authed. */
  requireAuth: () => false,
  sendOtp: async () => {},
  verifyOtp: async () => {},
  signOut: async () => {},
});

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  // Callback to run after successful auth (e.g. save plan)
  const [pendingAction, setPendingAction] = useState(null);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        // If user just logged in and there's a pending action, run it
        if (s?.user && pendingAction) {
          pendingAction();
          setPendingAction(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [pendingAction]);

  const openAuthModal = useCallback(() => setShowAuthModal(true), []);
  const closeAuthModal = useCallback(() => {
    setShowAuthModal(false);
    setPendingAction(null);
  }, []);

  /**
   * Call before actions that need auth (e.g. save plan).
   * If user is logged in, returns true immediately.
   * If not, opens the auth modal and queues the action for after login.
   * @param {Function} [onAuth] - optional callback to run once authenticated
   * @returns {boolean} true if already authenticated
   */
  const requireAuth = useCallback((onAuth) => {
    if (user) return true;
    if (!supabase) return true; // no Supabase = offline mode, allow everything
    if (onAuth) setPendingAction(() => onAuth);
    setShowAuthModal(true);
    return false;
  }, [user]);

  // Run pending action when user becomes available
  useEffect(() => {
    if (user && pendingAction) {
      pendingAction();
      setPendingAction(null);
      setShowAuthModal(false);
    }
  }, [user, pendingAction]);

  const sendOtp = async (email) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
      },
    });
    if (error) throw error;
    return data;
  };

  const verifyOtp = async (email, token) => {
    if (!supabase) throw new Error('Supabase not configured');
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });
    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    if (!supabase) return;
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{
      user, session, loading,
      showAuthModal, openAuthModal, closeAuthModal, requireAuth,
      sendOtp, verifyOtp, signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
