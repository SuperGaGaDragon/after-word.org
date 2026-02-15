import './AboutPage.css';

export function AboutPage() {
  return (
    <main className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <h1 className="hero-title">Your Essay Deserves More Than "Good Enough."</h1>
        <p className="hero-subtitle">
          Afterword helps you see your writing the way admissions officers do.
        </p>
      </section>

      {/* Problem Section */}
      <section className="about-problem">
        <p className="problem-question">
          Are you staring at your college essay wondering if it's good enough?
        </p>
        <p className="problem-question">
          Do you wish someone would tell you what admissions officers actually see?
        </p>
        <p className="problem-question">
          What are they really looking for — beyond grades and achievements?
        </p>
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
    </main>
  );
}
