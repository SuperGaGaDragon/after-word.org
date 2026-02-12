import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
  return (
    <main className="home-page">
      <section className="hero-section">
        <div className="hero-content">
          <p className="eyebrow">AI-Assisted Writing Platform</p>
          <h1 className="hero-title">Welcome to AfterWord</h1>
          <p className="hero-subtitle">
            Iterative improvement through intelligent feedback. Refine your writing with AI-powered analysis.
          </p>
          <div className="hero-actions">
            <Link to="/works" className="btn-primary-large">
              Go to Works
            </Link>
            <Link to="/why" className="btn-secondary-large">
              Learn More
            </Link>
          </div>
        </div>
      </section>

      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">📝</div>
          <h3>Iterative Writing</h3>
          <p>Create, submit, and continuously improve your work with AI guidance.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🤖</div>
          <h3>AI Analysis</h3>
          <p>Get detailed feedback on grammar, clarity, logic, and style.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">📊</div>
          <h3>Version Control</h3>
          <p>Track your progress with automatic version history and comparison.</p>
        </div>
        <div className="feature-card">
          <div className="feature-icon">🎯</div>
          <h3>Focused Feedback</h3>
          <p>Address sentence-level comments and mark them as resolved or rejected.</p>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to start writing?</h2>
        <p>Begin your iterative improvement journey today.</p>
        <Link to="/works" className="btn-primary-large">
          Create Your First Work
        </Link>
      </section>
    </main>
  );
}
