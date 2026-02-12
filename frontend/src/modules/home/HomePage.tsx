import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTotalProjectCount, getTotalWordCount, listWorks } from '../works/api/workApi';
import './HomePage.css';

export function HomePage() {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [recentWorkId, setRecentWorkId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, words, works] = await Promise.all([
          getTotalProjectCount(),
          getTotalWordCount(),
          listWorks()
        ]);
        setProjectCount(projects);
        setWordCount(words);

        // Get most recently updated work (list is already sorted by updated_at DESC)
        if (works.length > 0) {
          setRecentWorkId(works[0].workId);
        }
      } catch (error) {
        console.error('Failed to load statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    void loadStats();
  }, []);

  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">
            With after-word, you are one step closer to your dream school!
          </h1>

          <div className="dashboard-grid">
            <div className="stats-container">
              {loading ? (
                <p className="stats-loading">Loading your progress...</p>
              ) : (
                <>
                  <div className="stat-item">
                    <span className="stat-label">You have created</span>
                    <span className="stat-number">{projectCount ?? 0}</span>
                    <span className="stat-unit">works.</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">You have jotted</span>
                    <span className="stat-number">{wordCount ?? 0}</span>
                    <span className="stat-unit">words!</span>
                  </div>
                </>
              )}
            </div>

            <div className="quick-start-container">
              <h3 className="quick-start-title">Quick Start</h3>
              {loading ? (
                <p className="quick-start-loading">Loading...</p>
              ) : recentWorkId ? (
                <>
                  <p className="quick-start-description">Continue your most recent work</p>
                  <Link to={`/works/${recentWorkId}`} className="btn-quick-start">
                    Resume Editing
                  </Link>
                </>
              ) : (
                <p className="quick-start-empty">No works yet. Create your first one!</p>
              )}
            </div>
          </div>

          <div className="hero-actions">
            <Link to="/works" className="btn-primary-large">
              Go to Workspace
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
