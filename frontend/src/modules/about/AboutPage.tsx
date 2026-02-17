import { useState } from 'react';
import './AboutPage.css';

export function AboutPage() {
  const [rotation, setRotation] = useState(0);
  const [devLogoRotation, setDevLogoRotation] = useState(0);

  const handleImageClick = () => {
    setRotation(r => r + 180);
  };

  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1 className="hero-title">
          Afterword helps you see your writing the way admissions officers do.
        </h1>
      </section>

      {/* Problem Section */}
      <section className="about-problem">
        <div className="problem-image-wrap" onClick={handleImageClick}>
          <div className="problem-float-inner">
            <img
              src="/images/logo.png"
              alt="Afterword"
              className="problem-float-image"
              style={{ transform: `rotate(${rotation}deg)` }}
            />
          </div>
        </div>
        <div className="problem-questions">
          <p className="problem-question">
            Are you staring at your college essay wondering if it's good enough?
          </p>
          <p className="problem-question">
            Do you wish someone would tell you what admissions officers actually see?
          </p>
          <p className="problem-question">
            What are they really looking for — beyond grades and achievements?
          </p>
        </div>
      </section>

      {/* What We Do Section */}
      <section className="about-what">
        <h2 className="section-title">
          We Tell You What Admissions Officers Can't Always Put Into Words.
        </h2>
        <div className="feature-cards">
          <div className="feature-card">
            <h3 className="card-title">Depth of Reflection</h3>
            <p className="card-body">
              We evaluate how deeply you think, not just what you did.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="card-title">Authentic Voice</h3>
            <p className="card-body">
              We analyze whether your story truly sounds like you.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="card-title">Narrative Clarity</h3>
            <p className="card-body">
              We assess structure, pacing, and emotional progression.
            </p>
          </div>
          <div className="feature-card">
            <h3 className="card-title">College Fit</h3>
            <p className="card-body">
              We identify whether your essay connects meaningfully to your intended path.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="about-how">
        <h2 className="section-title">Revision Is Where Growth Happens.</h2>
        <div className="timeline">
          <div className="timeline-step">
            <div className="step-number">Step 1</div>
            <h3 className="step-title">Structured Feedback</h3>
            <p className="step-body">
              Receive an overall evaluation and line-by-line analysis — not vague comments.
            </p>
          </div>
          <div className="timeline-step">
            <div className="step-number">Step 2</div>
            <h3 className="step-title">Resolve & Improve</h3>
            <p className="step-body">
              Revise individual sentences and resubmit only the improved parts.
            </p>
          </div>
          <div className="timeline-step">
            <div className="step-number">Step 3</div>
            <h3 className="step-title">Track Your Progress</h3>
            <p className="step-body">
              Every draft is saved automatically, so your improvement builds visibly.
            </p>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="about-philosophy">
        <h2 className="philosophy-title">Completely Free. Completely Focused.</h2>
        <div className="philosophy-body">
          <p>No paywalls. No premium plans.</p>
          <p>No generic chatbot responses.</p>
          <p>&nbsp;</p>
          <p>Just thoughtful, admissions-focused feedback</p>
          <p>designed to help you tell your real story</p>
          <p>clearly, confidently, and authentically.</p>
        </div>
      </section>

      {/* Developer Section */}
      <section className="about-developers">
        <div className="dev-header">
          <img
            src="/images/logo.png"
            alt="Afterword Logo"
            className="dev-logo"
            style={{ transform: `rotate(${devLogoRotation}deg)` }}
            onClick={() => setDevLogoRotation(r => r + 180)}
          />
          <h2 className="dev-title">Meet the Team</h2>
          <p className="dev-subtitle">
            Built by students, for students — because we know what it feels like.
          </p>
        </div>
        <div className="dev-cards">
          <div className="dev-card">
            <div className="dev-photo-wrap">
              <img src="/images/developer1.png" alt="Daniel Lu" className="dev-photo" />
              <div className="dev-photo-overlay" />
            </div>
            <div className="dev-info">
              <h3 className="dev-name">Daniel Lu</h3>
              <span className="dev-tag">Developer</span>
            </div>
          </div>
          <div className="dev-card">
            <div className="dev-photo-wrap">
              <img src="/images/developer2.jpg" alt="Jorlanda Chen" className="dev-photo" />
              <div className="dev-photo-overlay" />
            </div>
            <div className="dev-info">
              <h3 className="dev-name">Jorlanda Chen</h3>
              <span className="dev-tag">Developer</span>
            </div>
          </div>
          <div className="dev-card">
            <div className="dev-photo-wrap">
              <img src="/images/developer3.jpg" alt="Quanhao Li" className="dev-photo" />
              <div className="dev-photo-overlay" />
            </div>
            <div className="dev-info">
              <h3 className="dev-name">Quanhao Li</h3>
              <span className="dev-tag">Developer</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
