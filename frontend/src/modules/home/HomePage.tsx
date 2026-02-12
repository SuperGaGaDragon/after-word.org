import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getTotalProjectCount, getTotalWordCount } from '../works/api/workApi';
import './HomePage.css';

export function HomePage() {
  const [projectCount, setProjectCount] = useState<number | null>(null);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [projects, words] = await Promise.all([
          getTotalProjectCount(),
          getTotalWordCount()
        ]);
        setProjectCount(projects);
        setWordCount(words);
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

          <div className="hero-actions">
            <Link to="/works" className="btn-primary-large">
              Go to Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
