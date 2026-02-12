export type SuggestionActionType = 'resolved' | 'rejected';

export type SuggestionActionInput = {
  action: SuggestionActionType;
  userNote?: string;
};

export type WorkUpdateInput = {
  content: string;
  deviceId: string;
  autoSave: boolean;
};

export type WorkUpdateResponse = {
  ok: boolean;
  version: number;
};

export type WorkSubmitInput = {
  content: string;
  deviceId: string;
  faoReflection?: string;
  suggestionActions: Record<string, SuggestionActionInput>;
};

export type WorkSubmitResponse = {
  ok: boolean;
  version: number;
  analysisId: string;
};

export type AnalysisComment = {
  id: string;
  originalText: string;
  issueType: string;
  severity: string;
  title: string;
  description: string;
  suggestion: string;
  improvementFeedback?: string;
};

export type WorkAnalysis = {
  analysisId: string;
  faoComment: string;
  sentenceComments: AnalysisComment[];
  reflectionComment?: string;
};

export type WorkVersionDetail = {
  versionNumber: number;
  content: string;
  isSubmitted: boolean;
  createdAt: string;
  analysis?: WorkAnalysis;
};

export type SubmitAndFetchAnalysisResult = {
  submit: WorkSubmitResponse;
  versionDetail: WorkVersionDetail;
};
