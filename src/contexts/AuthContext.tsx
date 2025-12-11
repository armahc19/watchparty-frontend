import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthState, LoginFormData, SignupFormData } from '../types/auth';

interface AuthContextType extends AuthState {
  login: (data: LoginFormData) => Promise<void>;
  signup: (data: SignupFormData) => Promise<void>;
  logout: () => Promise<void>;
}

// In your AuthContext, make sure the value includes isAuthenticated

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: false,
  });

  // Get user profile from our database
  const getUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return data;
  };

  // Login with Supabase
  // Login with Supabase
  const login = async (data: LoginFormData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
  
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });
  
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  
    // DO NOTHING ELSE → let onAuthStateChange update the state
    // (remove all the getUserProfile + manual setAuthState code)
  };

  // Signup with Supabase
  const signup = async (data: SignupFormData): Promise<void> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));
  
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { username: data.username }, // optional
      },
    });
  
    if (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  
    // DO NOTHING ELSE → let onAuthStateChange handle it
  };

  const logout = async (): Promise<void> => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Logout error:', error);
    
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
  };

  // Check for existing session on mount
  // ←←← REPLACE THE WHOLE useEffect THAT CHECKS SESSION WITH THIS ONE ←←←
useEffect(() => {
  // Initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthState(session);
  });

  const { data: { subscription } } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      updateAuthState(session);
    }
  );

  return () => subscription.unsubscribe();
}, []);

// New shared function (add this inside AuthProvider, outside the useEffect)
const updateAuthState = async (session: Session | null) => {
  if (!session?.user) {
    setAuthState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
    });
    return;
  }

  // Immediately mark as authenticated → triggers navigation instantly
  setAuthState(prev => ({
    ...prev,
    user: {
      id: session.user.id,
      email: session.user.email!,
      username: session.user.email!.split('@')[0], // fast fallback
      createdAt: new Date().toISOString(),
    },
    isAuthenticated: true,
    isLoading: false,
  }));

  // Then load real profile in background (does NOT block navigation)
  const profile = await getUserProfile(session.user.id);
  if (profile?.username) {
    setAuthState(prev => ({
      ...prev,
      user: {
        ...prev.user!,
        username: profile.username,
        createdAt: profile.created_at || prev.user!.createdAt,
      },
    }));
  }
};

  const value: AuthContextType = {
    ...authState,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};