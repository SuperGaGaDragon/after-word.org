import { useState } from 'react';
import {
  submitAndFetchAnalysis,
  updateWork
} from '../api/workApi';
import {
  SubmitAndFetchAnalysisResult,
  SuggestionActionInput
} from '../types/workContract';

type WorkContractState = {
  isSubmitting: boolean;
  isSaving: boolean;
  errorMessage: string | null;
  lastSavedVersion: number | null;
  lastSubmitResult: SubmitAndFetchAnalysisResult | null;
};

const DEFAULT_DEVICE_ID = 'web-phase2-device';

export function useWorkContractActions(workId: string | undefined) {
  const [state, setState] = useState<WorkContractState>({
    isSubmitting: false,
    isSaving: false,
    errorMessage: null,
    lastSavedVersion: null,
    lastSubmitResult: null
  });

  async function runUpdate(content: string, autoSave: boolean) {
    if (!workId) {
      return;
    }

    setState((prev) => ({ ...prev, isSaving: true, errorMessage: null }));

    try {
      const response = await updateWork(workId, {
        content,
        deviceId: DEFAULT_DEVICE_ID,
        autoSave
      });

      setState((prev) => ({
        ...prev,
        isSaving: false,
        lastSavedVersion: response.version
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSaving: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown save error'
      }));
    }
  }

  async function runSubmit(
    content: string,
    faoReflection: string,
    suggestionActions: Record<string, SuggestionActionInput>
  ) {
    if (!workId) {
      return;
    }

    setState((prev) => ({ ...prev, isSubmitting: true, errorMessage: null }));

    try {
      const result = await submitAndFetchAnalysis(workId, {
        content,
        deviceId: DEFAULT_DEVICE_ID,
        faoReflection,
        suggestionActions
      });

      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        lastSubmitResult: result
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isSubmitting: false,
        errorMessage: error instanceof Error ? error.message : 'Unknown submit error'
      }));
    }
  }

  return {
    state,
    runUpdate,
    runSubmit
  };
}
