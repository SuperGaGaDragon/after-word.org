import { Link } from 'react-router-dom';
import { WorkSummary } from '../types/workContract';

type WorksListPanelProps = {
  items: WorkSummary[];
  loading: boolean;
  error: string | null;
  onCreate: () => void;
  onDelete: (workId: string) => void;
};

function formatTimeLabel(value: string): string {
  if (!value) {
    return 'Unknown time';
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  return parsed.toLocaleString();
}

export function WorksListPanel({
  items,
  loading,
  error,
  onCreate,
  onDelete
}: WorksListPanelProps) {
  return (
    <section className="works-panel" aria-label="works list">
      <div className="works-panel-header">
        <h2>Your Works</h2>
        <button type="button" onClick={onCreate}>
          New Work
        </button>
      </div>

      {loading && <p>Loading works...</p>}
      {error && <p className="contract-error">{error}</p>}

      {!loading && items.length === 0 && <p>No works yet.</p>}

      {!loading && items.length > 0 && (
        <ul className="works-list">
          {items.map((item) => (
            <li key={item.workId} className="works-item">
              <div>
                <Link to={`/works/${encodeURIComponent(item.workId)}`}>Untitled Work</Link>
                <p>{formatTimeLabel(item.updatedAt)}</p>
              </div>
              <button type="button" onClick={() => onDelete(item.workId)}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
