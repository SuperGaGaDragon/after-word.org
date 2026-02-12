import { useParams } from 'react-router-dom';
import { WorkDetailPanel } from './components/WorkDetailPanel';
import { useWorkDetail } from './hooks/useWorkDetail';
import { renameWork } from './api/workApi';
import { EditableTitle } from '../../components/modal/EditableTitle';
import './WorkDetailPage.css';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const {
    state,
    setContent,
    setEssayPrompt,
    setFaoReflectionDraft,
    save,
    submit,
    openVersion,
    revert,
    loadAll,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount,
    canLoadMoreVersions,
    loadMoreVersions
  } = useWorkDetail(workId);

  const handleRename = async (newTitle: string) => {
    if (workId) {
      await renameWork(workId, newTitle);
      await loadAll({ preserveLocalDraft: true });
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <h1 className="work-detail-title">
          <EditableTitle
            title={state.work?.title || ''}
            placeholder="Untitled Work"
            onRename={handleRename}
          />
        </h1>
        <p>Read, save, submit, inspect versions, and revert.</p>
      </header>

      <WorkDetailPanel
        workId={workId}
        content={state.content}
        essayPrompt={state.essayPrompt}
        faoReflectionDraft={state.faoReflectionDraft}
        currentVersionNumber={state.work?.currentVersion}
        versions={state.versions}
        hiddenVersionCount={state.hiddenVersionCount}
        canLoadMoreVersions={canLoadMoreVersions}
        selectedVersion={state.selectedVersion}
        baselineSubmittedVersion={state.baselineSubmittedVersion}
        suggestionMarkings={state.suggestionMarkings}
        unprocessedCommentCount={unprocessedCommentCount}
        loading={state.loading}
        saving={state.saving}
        submitting={state.submitting}
        reverting={state.reverting}
        locked={state.locked}
        lockRetryInSec={state.lockRetryInSec}
        error={state.error}
        info={state.info}
        onContentChange={setContent}
        onEssayPromptChange={setEssayPrompt}
        onFaoReflectionChange={setFaoReflectionDraft}
        onSaveAuto={() => void save(true)}
        onSaveDraft={() => save(false)}
        onSubmit={() => void submit()}
        onOpenVersion={(versionNumber) => void openVersion(versionNumber)}
        onLoadMoreVersions={loadMoreVersions}
        onRevert={(versionNumber) => revert(versionNumber)}
        onMarkSuggestionAction={markSuggestionAction}
        onSuggestionNoteChange={setSuggestionNote}
      />
    </main>
  );
}
