import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Session, User } from '@supabase/supabase-js';

// --- MOCK CONFIGURATION ---
// Set this to false to use real Supabase Auth
const USE_MOCK_AUTH = false;

const MOCK_SESSION: Session = {
  access_token: 'mock-access-token',
  token_type: 'bearer',
  expires_in: 3600,
  refresh_token: 'mock-refresh-token',
  user: {
    id: 'mock-user-123',
    aud: 'authenticated',
    role: 'authenticated',
    email: 'demo@leadflow.app',
    email_confirmed_at: new Date().toISOString(),
    phone: '',
    confirmed_at: new Date().toISOString(),
    last_sign_in_at: new Date().toISOString(),
    app_metadata: {
      provider: 'email',
      providers: ['email'],
    },
    user_metadata: {
      first_name: 'Mario',
      last_name: 'Rossi',
      company_name: 'Rossi Solutions',
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
};
// --------------------------

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      if (USE_MOCK_AUTH) {
        console.log("⚠️ LeadFlow: Using Mock Authentication");
        // Simulate a tiny delay for realism
        setTimeout(() => {
          setSession(MOCK_SESSION);
          setLoading(false);
        }, 500);
        return;
      }

      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.warn("Supabase auth session warning:", error.message);
        }
        setSession(data?.session ?? null);
      } catch (err) {
        console.error("Supabase initialization error (check credentials):", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // Listen for changes (Only if not mocking)
    if (!USE_MOCK_AUTH) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
        setLoading(false);
      });
      return () => subscription.unsubscribe();
    }
  }, []);

  const signOut = async () => {
    if (USE_MOCK_AUTH) {
      setSession(null);
      // If you want to allow re-login in mock mode, you might need a "Login" button implementation 
      // that sets the session back, or just refresh the page.
    } else {
      await supabase.auth.signOut();
    }
  };

  const value = {
    session,
    user: session?.user ?? null,
    loading,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};