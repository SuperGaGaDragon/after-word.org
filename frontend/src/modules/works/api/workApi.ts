import {
  fromApiSubmitResponse,
  fromApiVersionDetail,
  toApiSuggestionActions
} from '../adapters/workContractAdapters';
import {
  SubmitAndFetchAnalysisResult,
  WorkSubmitInput,
  WorkSubmitResponse,
  WorkUpdateInput,
  WorkUpdateResponse,
  WorkVersionDetail
} from '../types/workContract';

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

function getAuthToken(): string | null {
  return localStorage.getItem('token');
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAuthToken();
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

    const code = payload?.code ? `[${payload.code}] ` : '';
    const message = payload?.message ?? `Request failed with status ${response.status}`;
    throw new Error(`${code}${message}`);
  }

  return (await response.json()) as T;
}

export async function updateWork(
  workId: string,
  input: WorkUpdateInput
): Promise<WorkUpdateResponse> {
  return requestJson<WorkUpdateResponse>(`/api/work/${workId}/update`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
      device_id: input.deviceId,
      auto_save: input.autoSave
    })
  });
}

export async function submitWork(
  workId: string,
  input: WorkSubmitInput
): Promise<WorkSubmitResponse> {
  const payload = await requestJson<{
    ok: boolean;
    version: number;
    analysis_id: string;
  }>(`/api/work/${workId}/submit`, {
    method: 'POST',
    body: JSON.stringify({
      content: input.content,
      device_id: input.deviceId,
      fao_reflection: input.faoReflection?.trim() || null,
      suggestion_actions: toApiSuggestionActions(input.suggestionActions)
    })
  });

  return fromApiSubmitResponse(payload);
}

export async function getVersionDetail(
  workId: string,
  versionNumber: number
): Promise<WorkVersionDetail> {
  const payload = await requestJson<{
    version_number: number;
    content: string;
    is_submitted: boolean;
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
