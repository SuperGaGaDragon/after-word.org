import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuthSession } from '../auth/session/AuthSessionContext';
import { useWorkDetail } from './hooks/useWorkDetail';
import { renameWork, getVersionDetail } from './api/workApi';
import { ReviewWorkPanel } from './components/review/ReviewWorkPanel';
import { VersionViewPanel } from './components/review/VersionViewPanel';
import { WorkVersionDetail } from './types/workContract';
import { getLocalWork, updateLocalWork } from './localWorkStorage';
import './WorkDetailPage.css';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSession();
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get('version');
  const [versionView, setVersionView] = useState<WorkVersionDetail | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(false);
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  // Local work state (for unauthenticated users)
  const [localContent, setLocalContent] = useState('');
  const [localTitle, setLocalTitle] = useState('');
  const isLocalWork = workId?.startsWith('local_');
  const {
    state,
    setContent,
    setEssayPrompt,
    setFaoReflectionDraft,
    save,
    submit,
    loadAll,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount
  } = useWorkDetail(isLocalWork ? undefined : workId);

  // Load local work data
  useEffect(() => {
    if (isLocalWork && workId) {
      const localWork = getLocalWork(workId);
      if (!localWork) {
        navigate('/home');
        return;
      }
      setLocalContent(localWork.content);
      setLocalTitle(localWork.title);
    }
  }, [isLocalWork, workId, navigate]);

  useEffect(() => {
    if (workId && versionParam) {
      const versionNumber = parseInt(versionParam, 10);
      if (!isNaN(versionNumber)) {
        void loadVersion(versionNumber);
      }
    }
  }, [workId, versionParam]);

  const loadVersion = async (versionNumber: number) => {
    if (!workId) return;
    setLoadingVersion(true);
    try {
      const version = await getVersionDetail(workId, versionNumber);
      setVersionView(version);
    } catch (error) {
      console.error('Failed to load version:', error);
    } finally {
      setLoadingVersion(false);
    }
  };

  const handleRename = async (newTitle: string) => {
    if (isLocalWork && workId) {
      updateLocalWork(workId, { title: newTitle });
      setLocalTitle(newTitle);
    } else if (workId) {
      await renameWork(workId, newTitle);
      await loadAll({ preserveLocalDraft: true });
    }
  };

  const handleLocalContentChange = (value: string) => {
    if (workId) {
      setLocalContent(value);
      updateLocalWork(workId, { content: value });
    }
  };

  const handleLocalSubmit = () => {
    if (!isAuthenticated) {
      setShowLoginPrompt(true);
    } else {
      // Should not happen for local works, but handle gracefully
      console.warn('Local work submit called with authenticated user');
    }
  };

  if (state.loading || loadingVersion) {
    return (
      <main className="work-detail-page-main">
        <div className="loading-container">
          <p>{loadingVersion ? 'Loading version...' : 'Loading work detail...'}</p>
        </div>
      </main>
    );
  }

  // If viewing a specific version
  if (versionView) {
    return (
      <main className="work-detail-page-main">
        <VersionViewPanel
          workId={workId}
          title={state.work?.title || ''}
          versionDetail={versionView}
          onRename={handleRename}
        />
      </main>
    );
  }

  return (
    <main className="work-detail-page-main">
      <ReviewWorkPanel
        workId={workId}
        title={isLocalWork ? localTitle : (state.work?.title || '')}
        onRename={handleRename}
        content={isLocalWork ? localContent : state.content}
        essayPrompt={isLocalWork ? '' : state.essayPrompt}
        faoReflectionDraft={isLocalWork ? '' : state.faoReflectionDraft}
        currentVersionNumber={isLocalWork ? undefined : state.work?.currentVersion}
        baselineSubmittedVersion={isLocalWork ? null : state.baselineSubmittedVersion}
        suggestionMarkings={isLocalWork ? {} : state.suggestionMarkings}
        unprocessedCommentCount={isLocalWork ? 0 : unprocessedCommentCount}
        locked={isLocalWork ? false : state.locked}
        saving={isLocalWork ? false : state.saving}
        submitting={isLocalWork ? false : state.submitting}
        error={isLocalWork ? null : state.error}
        info={isLocalWork ? null : state.info}
        onContentChange={isLocalWork ? handleLocalContentChange : setContent}
        onEssayPromptChange={setEssayPrompt}
        onFaoReflectionChange={setFaoReflectionDraft}
        onSaveAuto={() => void save(true)}
        onSaveDraft={() => save(false)}
        onSubmit={isLocalWork ? handleLocalSubmit : () => void submit()}
        onMarkSuggestionAction={markSuggestionAction}
        onSuggestionNoteChange={setSuggestionNote}
      />

      {/* Login Prompt Modal */}
      {showLoginPrompt && (
        <div className="login-prompt-overlay" onClick={() => setShowLoginPrompt(false)}>
          <div className="login-prompt-modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="prompt-title">Please Login/Signup to Receive Full Features</h2>
            <p className="prompt-message">
              Get AI-powered feedback and analysis for your college essay.
            </p>
            <div className="prompt-actions">
              <button
                type="button"
                className="btn-modal-primary"
                onClick={() => navigate('/auth/login')}
              >
                Continue to Login
              </button>
              <button
                type="button"
                className="btn-modal-secondary"
                onClick={() => setShowLoginPrompt(false)}
              >
                Keep Editing
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
