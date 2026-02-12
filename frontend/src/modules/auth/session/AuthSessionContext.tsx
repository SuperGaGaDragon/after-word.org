import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import { AuthUser } from '../types/authTypes';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearStoredSession,
  getStoredUser,
  setStoredUser
} from './tokenStore';

type AuthSessionValue = {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (emailOrUsername: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  async function login(emailOrUsername: string, password: string) {
    const result = await loginApi(emailOrUsername, password);
    setStoredUser(result.user);
    setUser(result.user);
  }

  async function signup(email: string, username: string, password: string) {
    const result = await signupApi(email, username, password);
    setStoredUser(result.user);
    setUser(result.user);
  }

  function logout() {
    clearStoredSession();
    setUser(null);
  }

  useEffect(() => {
    function onSessionExpired() {
      setUser(null);
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  const value = useMemo<AuthSessionValue>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login,
      signup,
      logout
    }),
    [user]
  );

  return <AuthSessionContext.Provider value={value}>{children}</AuthSessionContext.Provider>;
}

export function useAuthSession() {
  const ctx = useContext(AuthSessionContext);
  if (!ctx) {
    throw new Error('useAuthSession must be used inside AuthSessionProvider');
  }
  return ctx;
}
