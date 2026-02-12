import { ReactNode, createContext, useContext, useEffect, useMemo, useState } from 'react';
import { loginApi, signupApi } from '../api/authApi';
import { AuthUser } from '../types/authTypes';
import {
  AUTH_SESSION_EXPIRED_EVENT,
  clearStoredSession,
  getStoredToken,
  getStoredUser,
  setStoredToken,
  setStoredUser
} from './tokenStore';

type AuthSessionValue = {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthSessionContext = createContext<AuthSessionValue | null>(null);

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => getStoredToken());
  const [user, setUser] = useState<AuthUser | null>(() => getStoredUser());

  async function login(email: string, password: string) {
    const result = await loginApi(email, password);
    setStoredToken(result.token);
    setStoredUser(result.user);
    setToken(result.token);
    setUser(result.user);
  }

  async function signup(email: string, username: string, password: string) {
    const result = await signupApi(email, username, password);
    setStoredToken(result.token);
    setStoredUser(result.user);
    setToken(result.token);
    setUser(result.user);
  }

  function logout() {
    clearStoredSession();
    setToken(null);
    setUser(null);
  }

  useEffect(() => {
    function onSessionExpired() {
      setToken(null);
      setUser(null);
    }

    window.addEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
    return () => window.removeEventListener(AUTH_SESSION_EXPIRED_EVENT, onSessionExpired);
  }, []);

  const value = useMemo<AuthSessionValue>(
    () => ({
      user,
      token,
      isAuthenticated: Boolean(token),
      login,
      signup,
      logout
    }),
    [token, user]
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
