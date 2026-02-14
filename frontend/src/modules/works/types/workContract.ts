export type SuggestionActionType = 'resolved' | 'rejected';

export type SuggestionActionInput = {
  action: SuggestionActionType;
  userNote?: string;
};

export type WorkSummary = {
  workId: string;
  updatedAt: string;
  title?: string;
};

export type WorkDetail = {
  workId: string;
  content: string;
  currentVersion: number;
  essayPrompt?: string;
  title?: string;
};

export type WorkUpdateInput = {
  content: string;
  deviceId: string;
  autoSave: boolean;
  essayPrompt?: string;
};

export type WorkUpdateResponse = {
  ok: boolean;
  version?: number;
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
  analysisId?: string;
};

export type AnalysisComment = {
  id: string;
  originalText: string;
  startIndex: number;
  endIndex: number;
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

export type WorkVersionSummary = {
  versionNumber: number;
  contentPreview: string;
  isSubmitted: boolean;
  changeType: string;
  createdAt: string;
};

export type WorkVersionDetail = {
  versionNumber: number;
  content: string;
  isSubmitted: boolean;
  userReflection?: string;
  changeType: string;
  createdAt: string;
  analysis?: WorkAnalysis;
};

export type WorkVersionList = {
  currentVersion: number;
  versions: WorkVersionSummary[];
};

export type RevertResponse = {
  ok: boolean;
  newVersion: number;
};

export type SubmitAndFetchAnalysisResult = {
  submit: WorkSubmitResponse;
  versionDetail: WorkVersionDetail;
};
