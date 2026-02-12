import { AuthUser } from '../types/authTypes';

const USER_KEY = 'auth_user';
export const AUTH_SESSION_EXPIRED_EVENT = 'auth:session-expired';

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

export function setStoredUser(user: AuthUser): void {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  localStorage.removeItem(USER_KEY);
}

export function clearStoredSession(): void {
  clearStoredUser();
}

export function handleSessionExpired(): void {
  clearStoredSession();
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(AUTH_SESSION_EXPIRED_EVENT));
  }
}
