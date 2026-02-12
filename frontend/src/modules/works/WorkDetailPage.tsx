import { useParams } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';
import { WorkDetailPanel } from './components/WorkDetailPanel';
import { useWorkDetail } from './hooks/useWorkDetail';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();
  const { state, setContent, save, submit, openVersion, revert } = useWorkDetail(workId);

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
        onSubmit={(faoReflection, suggestionActions) =>
          void submit(faoReflection, suggestionActions)
        }
        onOpenVersion={(versionNumber) => void openVersion(versionNumber)}
        onRevert={(versionNumber) => void revert(versionNumber)}
      />

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
