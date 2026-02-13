import { useParams } from 'react-router-dom';
import { useWorkDetail } from './hooks/useWorkDetail';
import { renameWork } from './api/workApi';
import { EditableTitle } from '../../components/modal/EditableTitle';
import { ReviewWorkPanel } from './components/review/ReviewWorkPanel';
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
    loadAll,
    markSuggestionAction,
    setSuggestionNote,
    unprocessedCommentCount
  } = useWorkDetail(workId);

  const handleRename = async (newTitle: string) => {
    if (workId) {
      await renameWork(workId, newTitle);
      await loadAll({ preserveLocalDraft: true });
    }
  };

  if (state.loading) {
    return (
      <main className="page">
        <div className="loading-container">
          <p>Loading work detail...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page work-detail-page-main">
      <header className="page-header">
        <h1 className="work-detail-title">
          <EditableTitle
            title={state.work?.title || ''}
            placeholder="Untitled Work"
            onRename={handleRename}
          />
        </h1>
        <p>Write, revise, and receive AI-powered feedback on your work.</p>
      </header>

      <ReviewWorkPanel
        workId={workId}
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
