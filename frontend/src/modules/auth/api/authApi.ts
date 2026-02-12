import { AuthResponse } from '../types/authTypes';

type ApiErrorPayload = {
  code?: string;
  message?: string;
};

function getApiBaseUrl(): string {
  const raw = import.meta.env.VITE_API_BASE_URL;
  if (!raw) {
    return '';
  }
  return String(raw).replace(/\/$/, '');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers ?? {})
    }
  });

  if (!response.ok) {
    let payload: ApiErrorPayload | undefined;
    try {
      payload = (await response.json()) as ApiErrorPayload;
    } catch {
      payload = undefined;
    }
    throw new Error(payload?.message ?? `Request failed with status ${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loginApi(
  emailOrUsername: string,
  password: string
): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({
      email_or_username: emailOrUsername,
      password
    })
  });
}

export async function signupApi(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  return requestJson<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify({
      email,
      username,
      password
    })
  });
}
