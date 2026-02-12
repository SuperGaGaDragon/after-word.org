import { useParams } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';
import { WorkDetailPanel } from './components/WorkDetailPanel';
import { useWorkDetail } from './hooks/useWorkDetail';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const {
    state,
    setContent,
    save,
    submit,
    openVersion,
    revert,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount
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
        versions={state.versions}
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
        onSaveAuto={() => void save(true)}
        onSaveDraft={() => void save(false)}
        onSubmit={(faoReflection) => void submit(faoReflection)}
        onOpenVersion={(versionNumber) => void openVersion(versionNumber)}
        onRevert={(versionNumber) => void revert(versionNumber)}
        onMarkSuggestionAction={markSuggestionAction}
        onSuggestionNoteChange={setSuggestionNote}
      />

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
