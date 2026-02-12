import { getStoredToken, handleSessionExpired } from '../../auth/session/tokenStore';

type ApiErrorPayload = {
  code?: string;
  message?: string;
};

export class ApiRequestError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.code = code;
  }
}

function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (raw) {
    return String(raw).replace(/\/$/, '');
  }

  if (
    typeof window !== 'undefined' &&
    window.location.hostname.endsWith('after-word.org')
  ) {
    return 'https://api.after-word.org';
  }

  return '';
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }

    const code = payload?.code;
    if (response.status === 401) {
      handleSessionExpired();
    }

    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status, code);
  }

  return (await response.json()) as T;
}

export type UserInfo = {
  id: string | null;
  email: string;
  username: string;
};

export async function getCurrentUser(): Promise<UserInfo> {
  return await requestJson<UserInfo>('/api/auth/me');
}

export async function changeUsername(newUsername: string): Promise<void> {
  await requestJson<{ ok: boolean }>('/api/auth/change_username', {
    method: 'POST',
    body: JSON.stringify({
      new_username: newUsername
    })
  });
}

export type ChangePasswordInput = {
  oldPassword: string;
  newPassword: string;
  newPasswordConfirm: string;
};

export async function changePassword(input: ChangePasswordInput): Promise<void> {
  await requestJson<{ ok: boolean }>('/api/auth/change_password', {
    method: 'POST',
    body: JSON.stringify({
      old_password: input.oldPassword,
      new_password: input.newPassword,
      new_password_confirm: input.newPasswordConfirm
    })
  });
}
