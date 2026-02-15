import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkCard } from '../../components/modal/WorkCard';
import { useAuthSession } from '../auth/session/AuthSessionContext';
import { useWorksList } from './hooks/useWorksList';
import { createLocalWork, listLocalWorks, deleteLocalWork, type LocalWork } from './localWorkStorage';
import './WorkspacePage.css';

export function WorkspacePage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthSession();
  const { state, runCreate, runDelete, reload } = useWorksList();

  // Local works state for unauthenticated users
  const [localWorks, setLocalWorks] = useState<LocalWork[]>([]);

  useEffect(() => {
    if (!isAuthenticated) {
      setLocalWorks(listLocalWorks());
    }
  }, [isAuthenticated]);

  async function handleCreate() {
    if (isAuthenticated) {
      const workId = await runCreate();
      navigate(`/works/${encodeURIComponent(workId)}`);
    } else {
      const work = createLocalWork();
      setLocalWorks(listLocalWorks());
      navigate(`/works/${encodeURIComponent(work.workId)}`);
    }
  }

  async function handleDelete(workId: string) {
    if (isAuthenticated) {
      await runDelete(workId);
    } else {
      deleteLocalWork(workId);
      setLocalWorks(listLocalWorks());
    }
  }

  async function handleRename() {
    if (isAuthenticated) {
      await reload();
    } else {
      setLocalWorks(listLocalWorks());
    }
  }

  // For unauthenticated users, show local works
  if (!isAuthenticated) {
    return (
      <main className="workspace-page">
        <div className="workspace-container">
          <div className="workspace-header">
            <h1 className="workspace-title">Workspace</h1>
            <button type="button" className="btn-create-work" onClick={() => void handleCreate()}>
              + New Work
            </button>
          </div>

          {localWorks.length === 0 && (
            <div className="workspace-empty">
              <p>No works yet.</p>
              <p className="workspace-empty-hint">Create your first work to get started!</p>
            </div>
          )}

          {localWorks.length > 0 && (
            <div className="workspace-grid">
              {localWorks.map((work) => (
                <WorkCard
                  key={work.workId}
                  workId={work.workId}
                  title={work.title || 'Untitled Work'}
                  createdAt={work.updatedAt}
                  updatedAt={work.updatedAt}
                  onDelete={handleDelete}
                  onRename={handleRename}
                />
              ))}
            </div>
          )}
        </div>
      </main>
    );
  }

  // For authenticated users, show server works
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
                title={work.title || 'Untitled Work'}
                createdAt={work.updatedAt}
                updatedAt={work.updatedAt}
                onDelete={handleDelete}
                onRename={handleRename}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
