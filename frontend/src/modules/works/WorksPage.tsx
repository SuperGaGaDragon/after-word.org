import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { TestRouteSwitches } from '../navigation/TestRouteSwitches';

export function WorksPage() {
  const [workId, setWorkId] = useState('');
  const navigate = useNavigate();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = workId.trim();
    if (!trimmed) {
      return;
    }
    navigate(`/works/${encodeURIComponent(trimmed)}`);
  }

  return (
    <main className="page">
      <header className="page-header">
        <h1>Works</h1>
        <p>Vertical slice entry for works.</p>
      </header>

      {/* TEST ONLY: this form/button is temporary for work detail route verification. */}
      <form className="work-form" onSubmit={handleSubmit}>
        <label htmlFor="work-id-input">Test work id</label>
        <input
          id="work-id-input"
          type="text"
          value={workId}
          onChange={(event) => setWorkId(event.target.value)}
        />
        <button type="submit">Open /works/{'{work_id}'}</button>
      </form>

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
