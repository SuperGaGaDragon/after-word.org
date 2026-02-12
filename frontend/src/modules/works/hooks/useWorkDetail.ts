import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ApiRequestError,
  getVersionDetail,
  getVersionList,
  getWork,
  revertToVersion,
  submitAndFetchAnalysis,
  updateWork
} from '../api/workApi';
import { WorkDetail, WorkVersionDetail, WorkVersionSummary } from '../types/workContract';

type SuggestionMarking = {
  action: 'resolved' | 'rejected';
  userNote?: string;
};

type UseWorkDetailState = {
  work: WorkDetail | null;
  content: string;
  versions: WorkVersionSummary[];
  selectedVersion: WorkVersionDetail | null;
  baselineSubmittedVersion: WorkVersionDetail | null;
  suggestionMarkings: Record<string, SuggestionMarking>;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  reverting: boolean;
  error: string | null;
  errorCode: string | null;
  info: string | null;
  locked: boolean;
  lockRetryInSec: number;
};

const DEFAULT_DEVICE_ID = 'web-phase5-device';
const AUTO_SAVE_DELAY_MS = 3000;
const LOCK_RETRY_INTERVAL_MS = 5000;

function mapApiError(error: unknown): { code: string | null; message: string } {
  if (error instanceof ApiRequestError) {
    const code = error.code ?? null;

    if (code === 'unauthorized' || error.status === 401) {
      return { code: code ?? 'unauthorized', message: 'Session expired. Please sign in again.' };
    }
    if (code === 'not_found' || error.status === 404) {
      return { code: code ?? 'not_found', message: 'Work not found.' };
    }
    if (code === 'locked' || error.status === 423) {
      return {
        code: code ?? 'locked',
        message: 'This work is locked by another device. Editor is now read-only.'
      };
    }
    if (code === 'validation_failed') {
      return { code, message: error.message || 'Validation failed. Please check your input.' };
    }
    if (code === 'llm_failed') {
      return {
        code,
        message: 'AI analysis is temporarily unavailable. Please try again in a moment.'
      };
    }
    if (code === 'suggestions_not_processed') {
      const raw = error.message || '';
      const missing = raw.match(/Unprocessed suggestions:\s*(\d+)\s*out of\s*(\d+)/i);
      if (missing) {
        const unprocessedCount = missing[1];
        const totalCount = missing[2];
        return {
          code,
          message: `You still have ${unprocessedCount} unprocessed sentence comments (total: ${totalCount}). Mark each as resolved or rejected before submit.`
        };
      }

      return {
        code,
        message:
          raw ||
          'Some sentence comments are still unprocessed. Mark each as resolved or rejected before submit.'
      };
    }
    if (code === 'rate_limit_exceeded' || error.status === 429) {
      return {
        code: code ?? 'rate_limit_exceeded',
        message: 'Rate limit reached. Please wait and try again.'
      };
    }

    return { code, message: error.message || 'Request failed.' };
  }

  if (error instanceof Error) {
    return { code: null, message: error.message };
  }

  return { code: null, message: 'Unknown request error' };
}

function findLatestSubmittedVersion(versions: WorkVersionSummary[]): WorkVersionSummary | null {
  const submitted = versions.filter((item) => item.isSubmitted);
  if (submitted.length === 0) {
    return null;
  }

  return submitted.reduce((acc, item) =>
    item.versionNumber > acc.versionNumber ? item : acc
  );
}

export function useWorkDetail(workId: string | undefined) {
  const [state, setState] = useState<UseWorkDetailState>({
    work: null,
    content: '',
    versions: [],
    selectedVersion: null,
    baselineSubmittedVersion: null,
    suggestionMarkings: {},
    loading: true,
    saving: false,
    submitting: false,
    reverting: false,
    error: null,
    errorCode: null,
    info: null,
    locked: false,
    lockRetryInSec: 0
  });

  const canOperate = useMemo(() => Boolean(workId), [workId]);
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoSaveInFlightRef = useRef(false);
  const pendingAutoSaveContentRef = useRef<string | null>(null);
  const lastSyncedContentRef = useRef('');

  const loadAll = useCallback(async () => {
    if (!workId) {
      setState((prev) => ({
        ...prev,
        loading: false,
        error: 'Missing work id',
        errorCode: 'validation_failed'
      }));
      return;
    }

    setState((prev) => ({
      ...prev,
      loading: true,
      error: null,
      errorCode: null,
      info: null
    }));

    try {
      const [work, versionList] = await Promise.all([getWork(workId), getVersionList(workId, 'all')]);

      const latestSubmitted = findLatestSubmittedVersion(versionList.versions);
      const latestSubmittedDetail = latestSubmitted
        ? await getVersionDetail(workId, latestSubmitted.versionNumber)
        : null;

      setState((prev) => {
        const baselineVersionChanged =
          latestSubmittedDetail?.versionNumber !== prev.baselineSubmittedVersion?.versionNumber;

        return {
          ...prev,
          work,
          content: work.content,
          versions: versionList.versions,
          selectedVersion: prev.selectedVersion ?? latestSubmittedDetail,
          baselineSubmittedVersion: latestSubmittedDetail,
          suggestionMarkings: baselineVersionChanged ? {} : prev.suggestionMarkings,
          loading: false,
          error: null,
          errorCode: null,
          locked: false,
          lockRetryInSec: 0
        };
      });

      lastSyncedContentRef.current = work.content;
      pendingAutoSaveContentRef.current = null;
    } catch (error) {
      const mapped = mapApiError(error);
      setState((prev) => ({
        ...prev,
        loading: false,
        error: mapped.message,
        errorCode: mapped.code,
        locked: mapped.code === 'locked' ? true : prev.locked
      }));
    }
  }, [workId]);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const setContent = useCallback((next: string) => {
    setState((prev) => ({ ...prev, content: next }));
  }, []);

  const runAutoSave = useCallback(
    async (content: string) => {
      if (!workId) {
        return;
      }

      if (autoSaveInFlightRef.current) {
        pendingAutoSaveContentRef.current = content;
        return;
      }

      if (content === lastSyncedContentRef.current) {
        return;
      }

      autoSaveInFlightRef.current = true;
      pendingAutoSaveContentRef.current = content;

      setState((prev) => ({
        ...prev,
        saving: true,
        error: null,
        errorCode: null,
        info: null
      }));

      try {
        await updateWork(workId, {
          content,
          deviceId: DEFAULT_DEVICE_ID,
          autoSave: true
        });

        lastSyncedContentRef.current = content;
        setState((prev) => ({
          ...prev,
          saving: false,
          locked: false,
          lockRetryInSec: 0,
          info: 'Auto-saved successfully'
        }));
      } catch (error) {
        const mapped = mapApiError(error);
        setState((prev) => ({
          ...prev,
          saving: false,
          error: mapped.message,
          errorCode: mapped.code,
          locked: mapped.code === 'locked' ? true : prev.locked
        }));
      } finally {
        autoSaveInFlightRef.current = false;
      }

      const pending = pendingAutoSaveContentRef.current;
      if (pending && pending !== lastSyncedContentRef.current) {
        await runAutoSave(pending);
      }
    },
    [workId]
  );

  const save = useCallback(
    async (autoSave: boolean) => {
      if (!workId) {
        return;
      }

      setState((prev) => ({
        ...prev,
        saving: true,
        error: null,
        errorCode: null,
        info: null
      }));

      try {
        const result = await updateWork(workId, {
          content: state.content,
          deviceId: DEFAULT_DEVICE_ID,
          autoSave
        });

        if (!autoSave) {
          await loadAll();
          lastSyncedContentRef.current = state.content;
        } else {
          lastSyncedContentRef.current = state.content;
        }

        setState((prev) => ({
          ...prev,
          saving: false,
          locked: false,
          lockRetryInSec: 0,
          info:
            result.version !== undefined
              ? `Saved with new version ${result.version}`
              : 'Auto-saved successfully'
        }));
      } catch (error) {
        const mapped = mapApiError(error);
        setState((prev) => ({
          ...prev,
          saving: false,
          error: mapped.message,
          errorCode: mapped.code,
          locked: mapped.code === 'locked' ? true : prev.locked
        }));
      }
    },
    [loadAll, state.content, workId]
  );

  useEffect(() => {
    if (!workId || state.loading || state.submitting || state.reverting) {
      return;
    }

    if (state.content === lastSyncedContentRef.current) {
      return;
    }

    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    autoSaveTimerRef.current = setTimeout(() => {
      void runAutoSave(state.content);
    }, AUTO_SAVE_DELAY_MS);

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [runAutoSave, state.content, state.loading, state.reverting, state.submitting, workId]);

  useEffect(() => {
    if (!state.locked || !workId) {
      return;
    }

    let remain = LOCK_RETRY_INTERVAL_MS / 1000;
    setState((prev) => ({ ...prev, lockRetryInSec: remain }));

    const timer = setInterval(() => {
      remain -= 1;
      if (remain <= 0) {
        remain = LOCK_RETRY_INTERVAL_MS / 1000;
        void loadAll();
      }
      setState((prev) => ({ ...prev, lockRetryInSec: remain }));
    }, 1000);

    return () => clearInterval(timer);
  }, [loadAll, state.locked, workId]);

  const markSuggestionAction = useCallback((commentId: string, action: 'resolved' | 'rejected') => {
    setState((prev) => ({
      ...prev,
      suggestionMarkings: {
        ...prev.suggestionMarkings,
        [commentId]: {
          ...prev.suggestionMarkings[commentId],
          action
        }
      }
    }));
  }, []);

  const setSuggestionNote = useCallback((commentId: string, userNote: string) => {
    setState((prev) => ({
      ...prev,
      suggestionMarkings: {
        ...prev.suggestionMarkings,
        [commentId]: {
          ...prev.suggestionMarkings[commentId],
          action: prev.suggestionMarkings[commentId]?.action ?? 'resolved',
          userNote
        }
      }
    }));
  }, []);

  const submit = useCallback(
    async (faoReflection: string) => {
      if (!workId) {
        return;
      }

      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      const requiredCommentIds =
        state.baselineSubmittedVersion?.analysis?.sentenceComments
          .map((comment) => comment.id)
          .filter(Boolean) ?? [];

      if (requiredCommentIds.length > 0) {
        const missingIds = requiredCommentIds.filter(
          (commentId) => !state.suggestionMarkings[commentId]?.action
        );

        if (missingIds.length > 0) {
          setState((prev) => ({
            ...prev,
            errorCode: 'suggestions_not_processed',
            error: `You still have ${missingIds.length} unprocessed sentence comments (total: ${requiredCommentIds.length}). Mark each as resolved or rejected before submit.`
          }));
          return;
        }
      }

      setState((prev) => ({
        ...prev,
        submitting: true,
        error: null,
        errorCode: null,
        info: null
      }));

      try {
        const result = await submitAndFetchAnalysis(workId, {
          content: state.content,
          deviceId: DEFAULT_DEVICE_ID,
          faoReflection,
          suggestionActions: state.suggestionMarkings
        });

        await loadAll();

        setState((prev) => ({
          ...prev,
          submitting: false,
          selectedVersion: result.versionDetail,
          baselineSubmittedVersion: result.versionDetail,
          suggestionMarkings: {},
          locked: false,
          lockRetryInSec: 0,
          info: `Submitted version ${result.submit.version} and loaded analysis`
        }));
      } catch (error) {
        const mapped = mapApiError(error);
        setState((prev) => ({
          ...prev,
          submitting: false,
          error: mapped.message,
          errorCode: mapped.code,
          locked: mapped.code === 'locked' ? true : prev.locked
        }));
      }
    },
    [loadAll, state.baselineSubmittedVersion?.analysis?.sentenceComments, state.content, state.suggestionMarkings, workId]
  );

  const openVersion = useCallback(
    async (versionNumber: number) => {
      if (!workId) {
        return;
      }

      setState((prev) => ({ ...prev, error: null, errorCode: null, info: null }));

      try {
        const detail = await getVersionDetail(workId, versionNumber);
        setState((prev) => ({
          ...prev,
          selectedVersion: detail,
          info: `Loaded version ${versionNumber}`
        }));
      } catch (error) {
        const mapped = mapApiError(error);
        setState((prev) => ({
          ...prev,
          error: mapped.message,
          errorCode: mapped.code
        }));
      }
    },
    [workId]
  );

  const revert = useCallback(
    async (targetVersion: number) => {
      if (!workId) {
        return;
      }

      setState((prev) => ({
        ...prev,
        reverting: true,
        error: null,
        errorCode: null,
        info: null
      }));

      try {
        const result = await revertToVersion(workId, targetVersion, DEFAULT_DEVICE_ID);
        const revertedDetail = await getVersionDetail(workId, result.newVersion);
        await loadAll();
        setState((prev) => ({
          ...prev,
          selectedVersion: revertedDetail,
          reverting: false,
          locked: false,
          lockRetryInSec: 0,
          info: `Reverted successfully. New draft version ${result.newVersion}`
        }));
      } catch (error) {
        const mapped = mapApiError(error);
        setState((prev) => ({
          ...prev,
          reverting: false,
          error: mapped.message,
          errorCode: mapped.code,
          locked: mapped.code === 'locked' ? true : prev.locked
        }));
      }
    },
    [loadAll, workId]
  );

  const unprocessedCommentCount = useMemo(() => {
    const requiredCommentIds =
      state.baselineSubmittedVersion?.analysis?.sentenceComments
        .map((comment) => comment.id)
        .filter(Boolean) ?? [];

    return requiredCommentIds.filter((commentId) => !state.suggestionMarkings[commentId]?.action)
      .length;
  }, [state.baselineSubmittedVersion?.analysis?.sentenceComments, state.suggestionMarkings]);

  return {
    state,
    canOperate,
    setContent,
    save,
    submit,
    openVersion,
    revert,
    loadAll,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount
  };
}
