import { getSupabaseClient } from '../db/replication';
import { User, Session, AuthChangeEvent } from '@supabase/supabase-js';

export interface AuthState {
  user: User | null;
  session: Session | null;
  loading: boolean;
}

type AuthCallback = (state: AuthState) => void;

const authCallbacks: AuthCallback[] = [];
let currentAuthState: AuthState = {
  user: null,
  session: null,
  loading: true
};

// Initialize auth state listener
export function initAuth() {
  const supabase = getSupabaseClient();

  // Get initial session
  supabase.auth.getSession().then(({ data: { session } }) => {
    updateAuthState({
      user: session?.user ?? null,
      session: session ?? null,
      loading: false
    });
  });

  // Listen for auth changes
  supabase.auth.onAuthStateChange(
    (event: AuthChangeEvent, session: Session | null) => {
      console.log('[Auth]', event, session?.user?.id);
      updateAuthState({
        user: session?.user ?? null,
        session: session ?? null,
        loading: false
      });
    }
  );
}

function updateAuthState(state: AuthState) {
  currentAuthState = state;
  authCallbacks.forEach(callback => callback(state));
}

export function subscribeToAuth(callback: AuthCallback): () => void {
  authCallbacks.push(callback);
  // Immediately call with current state
  callback(currentAuthState);
  
  // Return unsubscribe function
  return () => {
    const index = authCallbacks.indexOf(callback);
    if (index > -1) {
      authCallbacks.splice(index, 1);
    }
  };
}

export function getAuthState(): AuthState {
  return currentAuthState;
}

// Auth actions
export async function signUp(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signIn(email: string, password: string) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (error) throw error;
  return data;
}

export async function signOut() {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.signOut();
  
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const supabase = getSupabaseClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`
  });
  
  if (error) throw error;
}
