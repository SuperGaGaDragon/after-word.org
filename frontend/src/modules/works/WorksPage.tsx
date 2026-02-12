import { useNavigate } from 'react-router-dom';
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
      <WorksListPanel
        items={state.items}
        loading={state.loading}
        error={state.error}
        onCreate={() => void handleCreate()}
        onDelete={(workId) => void handleDelete(workId)}
      />
    </main>
  );
}
