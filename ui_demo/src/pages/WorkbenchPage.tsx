export default function WorkbenchPage() {
  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Works + Autosave</p>
        <h2>Draft editor flow with lock awareness</h2>
      </header>

      <div className="editor-grid">
        <article className="panel">
          <div className="panel-head">
            <h3>Current Draft</h3>
            <div className="pill-wrap">
              <span className="pill lock">Device lock active</span>
              <span className="pill">Autosave 3s</span>
            </div>
          </div>
          <div className="editor-surface">
            <p>
              I still remember the first time I realized engineering could change how people feel about
              difficult systems, not only how systems run. During my robotics club season...
            </p>
          </div>
          <div className="progress-track">
            <div className="progress-fill" />
          </div>
          <small>Draft checkpoint replay: 76%</small>
        </article>

        <article className="panel">
          <h3>Submit Guardrail</h3>
          <ul className="clean-list">
            <li>All sentence comments must be resolved or rejected.</li>
            <li>Reflection is optional but improves next-cycle guidance.</li>
            <li>Submitted versions are permanent milestones.</li>
            <li>Draft versions are auto-cleaned on next submit.</li>
          </ul>
          <button className="cta-wide">Submit For New AI Evaluation</button>
        </article>
      </div>
    </section>
  )
}
