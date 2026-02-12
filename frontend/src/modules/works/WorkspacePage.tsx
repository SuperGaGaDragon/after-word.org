import { useNavigate } from 'react-router-dom';
import { WorkCard } from '../../components/modal/WorkCard';
import { useWorksList } from './hooks/useWorksList';
import './WorkspacePage.css';

export function WorkspacePage() {
  const navigate = useNavigate();
  const { state, runCreate, runDelete } = useWorksList();

  async function handleCreate() {
    const workId = await runCreate();
    navigate(`/works/${encodeURIComponent(workId)}`);
  }

  async function handleDelete(workId: string) {
    await runDelete(workId);
  }

  function extractTitle(work: { workId: string; updatedAt: string }): string {
    // TODO: When work has content/title field, use it
    // For now, return "Untitled Work"
    return 'Untitled Work';
  }

  return (
    <main className="workspace-page">
      <div className="workspace-container">
        <div className="workspace-header">
          <h1 className="workspace-title">Workspace</h1>
          <button type="button" className="btn-create-work" onClick={() => void handleCreate()}>
            + New Work
          </button>
        </div>

        {state.loading && <p className="workspace-loading">Loading works...</p>}

        {state.error && (
          <div className="workspace-error" role="alert">
            {state.error}
          </div>
        )}

        {!state.loading && !state.error && state.items.length === 0 && (
          <div className="workspace-empty">
            <p>No works yet.</p>
            <p className="workspace-empty-hint">Create your first work to get started!</p>
          </div>
        )}

        {!state.loading && state.items.length > 0 && (
          <div className="workspace-grid">
            {state.items.map((work) => (
              <WorkCard
                key={work.workId}
                workId={work.workId}
                title={extractTitle(work)}
                createdAt={work.updatedAt} // TODO: Use actual createdAt when available
                updatedAt={work.updatedAt}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
