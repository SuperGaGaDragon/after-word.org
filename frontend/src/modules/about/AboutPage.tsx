import { TestRouteSwitches } from '../navigation/TestRouteSwitches';

export function AboutPage() {
  return (
    <main className="page">
      <header className="page-header">
        <h1>About</h1>
        {/* TEST ONLY: this text is temporary while building vertical slices. */}
        <p>Route ready for /about.</p>
      </header>

      <TestRouteSwitches className="route-switches" />
    </main>
  );
}
