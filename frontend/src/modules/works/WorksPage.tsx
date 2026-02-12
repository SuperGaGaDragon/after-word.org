import { useNavigate } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';
import { WorksListPanel } from './components/WorksListPanel';
import { useWorksList } from './hooks/useWorksList';

export function WorksPage() {
  const navigate = useNavigate();
  const { state, runCreate, runDelete } = useWorksList();

  async function handleCreate() {
    const workId = await runCreate();
    navigate(`/works/${encodeURIComponent(workId)}`);
  }

  async function handleDelete(workId: string) {
    await runDelete(workId);
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Works</h1>
        <p>Manage your works and open one to continue editing.</p>
      </header>

      <WorksListPanel
        items={state.items}
        loading={state.loading}
        error={state.error}
        onCreate={() => void handleCreate()}
        onDelete={(workId) => void handleDelete(workId)}
      />

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
