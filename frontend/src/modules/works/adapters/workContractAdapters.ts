import {
  SuggestionActionInput,
  WorkSubmitResponse,
  WorkVersionDetail
} from '../types/workContract';

type ApiSuggestionAction = {
  action: 'resolved' | 'rejected';
  user_note?: string;
};

type ApiSubmitResponse = {
  ok: boolean;
  version: number;
  analysis_id: string;
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

type ApiVersionDetail = {
  version_number: number;
  content: string;
  is_submitted: boolean;
  created_at: string;
  analysis?: {
    analysis_id: string;
    fao_comment: string;
    sentence_comments: ApiAnalysisComment[];
    reflection_comment?: string;
  };
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

export function fromApiVersionDetail(payload: ApiVersionDetail): WorkVersionDetail {
  return {
    versionNumber: payload.version_number,
    content: payload.content,
    isSubmitted: payload.is_submitted,
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
