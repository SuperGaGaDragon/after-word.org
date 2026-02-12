import { useParams } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';
import { WorkDetailPanel } from './components/WorkDetailPanel';
import { useWorkDetail } from './hooks/useWorkDetail';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const {
    state,
    setContent,
    setFaoReflectionDraft,
    save,
    submit,
    openVersion,
    revert,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount,
    canLoadMoreVersions,
    loadMoreVersions
  } = useWorkDetail(workId);

  return (
    <main className="page">
      <header className="page-header">
        <h1>Work Detail</h1>
        <p>Read, save, submit, inspect versions, and revert.</p>
      </header>

      <WorkDetailPanel
        workId={workId}
        content={state.content}
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

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
