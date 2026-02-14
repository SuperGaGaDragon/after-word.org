import { useParams, useSearchParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useWorkDetail } from './hooks/useWorkDetail';
import { renameWork, getVersionDetail } from './api/workApi';
import { ReviewWorkPanel } from './components/review/ReviewWorkPanel';
import { WorkVersionDetail } from './types/workContract';
import './WorkDetailPage.css';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const [searchParams] = useSearchParams();
  const versionParam = searchParams.get('version');
  const [versionView, setVersionView] = useState<WorkVersionDetail | null>(null);
  const [loadingVersion, setLoadingVersion] = useState(false);
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
  } = useWorkDetail(workId);

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
    if (workId) {
      await renameWork(workId, newTitle);
      await loadAll({ preserveLocalDraft: true });
    }
  };

  if (state.loading || loadingVersion) {
    return (
      <main className="page">
        <div className="loading-container">
          <p>{loadingVersion ? 'Loading version...' : 'Loading work detail...'}</p>
        </div>
      </main>
    );
  }

  // If viewing a specific version
  if (versionView) {
    return (
      <main className="page work-detail-page-main">
        <div className="version-view-header">
          <h2>Version {versionView.versionNumber} (Read-only)</h2>
          <p className="version-info">
            Created: {new Date(versionView.createdAt).toLocaleString()}
            {versionView.isSubmitted && ' • Submitted'}
          </p>
        </div>
        <ReviewWorkPanel
          workId={workId}
          title={state.work?.title || ''}
          onRename={handleRename}
          content={versionView.content}
          essayPrompt=""
          faoReflectionDraft={versionView.userReflection || ''}
          currentVersionNumber={versionView.versionNumber}
          baselineSubmittedVersion={versionView}
          suggestionMarkings={{}}
          unprocessedCommentCount={0}
          locked={true}
          saving={false}
          submitting={false}
          error={null}
          info="This is a read-only view of a previous version"
          onContentChange={() => {}}
          onEssayPromptChange={() => {}}
          onFaoReflectionChange={() => {}}
          onSaveAuto={() => {}}
          onSaveDraft={async () => {}}
          onSubmit={() => {}}
          onMarkSuggestionAction={() => {}}
          onSuggestionNoteChange={() => {}}
        />
      </main>
    );
  }

  return (
    <main className="page work-detail-page-main">
      <ReviewWorkPanel
        workId={workId}
        title={state.work?.title || ''}
        onRename={handleRename}
        content={state.content}
        essayPrompt={state.essayPrompt}
        faoReflectionDraft={state.faoReflectionDraft}
        currentVersionNumber={state.work?.currentVersion}
        baselineSubmittedVersion={state.baselineSubmittedVersion}
        suggestionMarkings={state.suggestionMarkings}
        unprocessedCommentCount={unprocessedCommentCount}
        locked={state.locked}
        saving={state.saving}
        submitting={state.submitting}
        error={state.error}
        info={state.info}
        onContentChange={setContent}
        onEssayPromptChange={setEssayPrompt}
        onFaoReflectionChange={setFaoReflectionDraft}
        onSaveAuto={() => void save(true)}
        onSaveDraft={() => save(false)}
        onSubmit={() => void submit()}
        onMarkSuggestionAction={markSuggestionAction}
        onSuggestionNoteChange={setSuggestionNote}
      />
    </main>
  );
}
