import {
  fromApiRevertResponse,
  fromApiSubmitResponse,
  fromApiVersionDetail,
  fromApiVersionList,
  fromApiWorkDetail,
  fromApiWorkList,
  toApiSuggestionActions
} from '../adapters/workContractAdapters';
import {
  RevertResponse,
  SubmitAndFetchAnalysisResult,
  WorkDetail,
  WorkSubmitInput,
  WorkSubmitResponse,
  WorkSummary,
  WorkUpdateInput,
  WorkUpdateResponse,
  WorkVersionDetail,
  WorkVersionList
} from '../types/workContract';
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

type CachedGetEntry<T> = {
  etag?: string;
  data: T;
  updatedAt: number;
};

const getCache = new Map<string, CachedGetEntry<unknown>>();

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
  const method = (init?.method ?? 'GET').toUpperCase();
  const isGet = method === 'GET';
  const cacheKey = isGet ? `${getApiBaseUrl()}${path}` : '';
  const cached = isGet ? (getCache.get(cacheKey) as CachedGetEntry<T> | undefined) : undefined;

  const token = getStoredToken();
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (isGet && cached?.etag) {
    headers.set('If-None-Match', cached.etag);
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    ...init,
    headers
  });

  if (!response.ok) {
    if (isGet && response.status === 304 && cached) {
      return cached.data;
    }
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
    if (response.status === 405) {
      throw new ApiRequestError(
        'Method not allowed. Check VITE_API_BASE_URL and ensure requests go to the backend API domain.',
        response.status,
        code
      );
    }
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new ApiRequestError(message, response.status, code);
  }

  const payload = (await response.json()) as T;

  if (isGet) {
    const etag = response.headers.get('etag') ?? response.headers.get('ETag') ?? undefined;
    getCache.set(cacheKey, {
      etag,
      data: payload,
      updatedAt: Date.now()
    });
  }

  return payload;
}

function invalidateWorkCache(workId?: string): void {
  if (!workId) {
    getCache.clear();
    return;
  }

  const prefixes = [
    `/api/work/list`,
    `/api/work/${workId}`,
    `/api/work/${workId}/versions`
  ];

  for (const key of getCache.keys()) {
    if (prefixes.some((prefix) => key.includes(prefix))) {
      getCache.delete(key);
    }
  }
}

export async function createWork(): Promise<string> {
  const payload = await requestJson<{ work_id: string }>('/api/work/create', {
    method: 'POST'
  });
  invalidateWorkCache();
  return payload.work_id;
}

export async function listWorks(): Promise<WorkSummary[]> {
  const payload = await requestJson<{ items: Array<{ work_id: string; updated_at: string }> }>(
    '/api/work/list'
  );
  return fromApiWorkList(payload.items);
}

export async function deleteWork(workId: string): Promise<void> {
  await requestJson<{ ok: boolean }>(`/api/work/${workId}`, {
    method: 'DELETE'
  });
  invalidateWorkCache(workId);
}

export async function getWork(workId: string): Promise<WorkDetail> {
  const payload = await requestJson<{
    work_id: string;
    content: string;
    current_version: number;
    essay_prompt?: string;
  }>(
    `/api/work/${workId}`
  );
  return fromApiWorkDetail(payload);
}

export async function updateWork(
  workId: string,
  input: WorkUpdateInput
): Promise<WorkUpdateResponse> {
  const result = await requestJson<WorkUpdateResponse>(`/api/work/${workId}/update`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
      device_id: input.deviceId,
      auto_save: input.autoSave,
      essay_prompt: input.essayPrompt
    })
  });
  invalidateWorkCache(workId);
  return result;
}

export async function submitWork(
  workId: string,
  input: WorkSubmitInput
): Promise<WorkSubmitResponse> {
  const payload = await requestJson<{
    ok: boolean;
    version: number;
    analysis_id?: string;
  }>(`/api/work/${workId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
      device_id: input.deviceId,
      fao_reflection: input.faoReflection?.trim() || null,
      suggestion_actions: toApiSuggestionActions(input.suggestionActions)
    })
  });

  invalidateWorkCache(workId);
  return fromApiSubmitResponse(payload);
}

export async function getVersionList(
  workId: string,
  type: 'all' | 'submitted' | 'draft' = 'all',
  parent?: number
): Promise<WorkVersionList> {
  const params = new URLSearchParams();
  params.set('type', type);
  if (type === 'draft' && typeof parent === 'number') {
    params.set('parent', String(parent));
  }

  const payload = await requestJson<{
    current_version: number;
    versions: Array<{
      version_number: number;
      content_preview: string;
      is_submitted: boolean;
      change_type: string;
      created_at: string;
    }>;
  }>(`/api/work/${workId}/versions?${params.toString()}`);

  return fromApiVersionList(payload);
}

export async function getVersionDetail(
  workId: string,
  versionNumber: number
): Promise<WorkVersionDetail> {
  const payload = await requestJson<{
    version_number: number;
    content: string;
    is_submitted: boolean;
    user_reflection?: string;
    change_type: string;
    created_at: string;
    analysis?: {
      analysis_id: string;
      fao_comment: string;
      sentence_comments: Array<{
        id: string;
        original_text: string;
        issue_type: string;
        severity: string;
        title: string;
        description: string;
        suggestion: string;
        improvement_feedback?: string;
      }>;
      reflection_comment?: string;
    };
  }>(`/api/work/${workId}/versions/${versionNumber}`);

  return fromApiVersionDetail(payload);
}

export async function revertToVersion(
  workId: string,
  targetVersion: number,
  deviceId: string
): Promise<RevertResponse> {
  const payload = await requestJson<{ ok: boolean; new_version: number }>(
    `/api/work/${workId}/revert`,
    {
      method: 'POST',
      body: JSON.stringify({
        target_version: targetVersion,
        device_id: deviceId
      })
    }
  );

  invalidateWorkCache(workId);
  return fromApiRevertResponse(payload);
}

export async function submitAndFetchAnalysis(
  workId: string,
  input: WorkSubmitInput
): Promise<SubmitAndFetchAnalysisResult> {
  const submit = await submitWork(workId, input);
  const versionDetail = await getVersionDetail(workId, submit.version);

  return {
    submit,
    versionDetail
  };
}
