import {
  RevertResponse,
  SuggestionActionInput,
  WorkDetail,
  WorkSubmitResponse,
  WorkSummary,
  WorkVersionDetail,
  WorkVersionList
} from '../types/workContract';

type ApiSuggestionAction = {
  action: 'resolved' | 'rejected';
  user_note?: string;
};

type ApiSubmitResponse = {
  ok: boolean;
  version: number;
  analysis_id?: string;
};

type ApiWorkListItem = {
  work_id: string;
  updated_at: string;
};

type ApiWorkDetail = {
  work_id: string;
  content: string;
  current_version: number;
};

type ApiAnalysisComment = {
  id: string;
  original_text: string;
  issue_type: string;
  severity: string;
  title: string;
  description: string;
  suggestion: string;
  improvement_feedback?: string;
};

type ApiVersionSummary = {
  version_number: number;
  content_preview: string;
  is_submitted: boolean;
  change_type: string;
  created_at: string;
};

type ApiVersionDetail = {
  version_number: number;
  content: string;
  is_submitted: boolean;
  user_reflection?: string;
  change_type: string;
  created_at: string;
  analysis?: {
    analysis_id: string;
    fao_comment: string;
    sentence_comments: ApiAnalysisComment[];
    reflection_comment?: string;
  };
};

type ApiVersionList = {
  current_version: number;
  versions: ApiVersionSummary[];
  next_cursor?: string | null;
};

type ApiRevertResponse = {
  ok: boolean;
  new_version: number;
};

export function toApiSuggestionActions(
  actions: Record<string, SuggestionActionInput>
): Record<string, ApiSuggestionAction> {
  return Object.fromEntries(
    Object.entries(actions).map(([commentId, action]) => {
      const trimmedNote = action.userNote?.trim();
      const value: ApiSuggestionAction = {
        action: action.action
      };

      if (trimmedNote) {
        value.user_note = trimmedNote;
      }

      return [commentId, value];
    })
  );
}

export function fromApiSubmitResponse(payload: ApiSubmitResponse): WorkSubmitResponse {
  return {
    ok: payload.ok,
    version: payload.version,
    analysisId: payload.analysis_id
  };
}

export function fromApiWorkList(items: ApiWorkListItem[]): WorkSummary[] {
  return items.map((item) => ({
    workId: item.work_id,
    updatedAt: item.updated_at
  }));
}

export function fromApiWorkDetail(payload: ApiWorkDetail): WorkDetail {
  return {
    workId: payload.work_id,
    content: payload.content,
    currentVersion: payload.current_version
  };
}

export function fromApiVersionList(payload: ApiVersionList): WorkVersionList {
  return {
    currentVersion: payload.current_version,
    versions: payload.versions.map((item) => ({
      versionNumber: item.version_number,
      contentPreview: item.content_preview,
      isSubmitted: item.is_submitted,
      changeType: item.change_type,
      createdAt: item.created_at
    })),
    nextCursor: payload.next_cursor ?? null
  };
}

export function fromApiVersionDetail(payload: ApiVersionDetail): WorkVersionDetail {
  return {
    versionNumber: payload.version_number,
    content: payload.content,
    isSubmitted: payload.is_submitted,
    userReflection: payload.user_reflection,
    changeType: payload.change_type,
    createdAt: payload.created_at,
    analysis: payload.analysis
      ? {
          analysisId: payload.analysis.analysis_id,
          faoComment: payload.analysis.fao_comment,
          sentenceComments: payload.analysis.sentence_comments.map((item) => ({
            id: item.id,
            originalText: item.original_text,
            issueType: item.issue_type,
            severity: item.severity,
            title: item.title,
            description: item.description,
            suggestion: item.suggestion,
            improvementFeedback: item.improvement_feedback
          })),
          reflectionComment: payload.analysis.reflection_comment
        }
      : undefined
  };
}

export function fromApiRevertResponse(payload: ApiRevertResponse): RevertResponse {
  return {
    ok: payload.ok,
    newVersion: payload.new_version
  };
}
