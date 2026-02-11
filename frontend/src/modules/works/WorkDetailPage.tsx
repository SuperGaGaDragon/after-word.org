import { useParams } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';

export function WorkDetailPage() {
  const { workId } = useParams<{ workId: string }>();

  return (
    <main className="page">
      <header className="page-header">
        <h1>Work Detail</h1>
        {/* TEST ONLY: detail content is intentionally minimal for route plumbing validation. */}
        <p>work_id: {workId ?? ''}</p>
      </header>

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
