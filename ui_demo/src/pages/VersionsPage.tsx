import { versions } from '../data'

export default function VersionsPage() {
  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Version System</p>
        <h2>Submitted milestones and draft replay history</h2>
      </header>

      <div className="timeline">
        {versions.map((item) => (
          <article key={item.id} className="panel timeline-item">
            <div className="timeline-dot" />
            <div>
              <div className="panel-head">
                <h3>{item.version}</h3>
                <span className={`pill ${item.type === 'Submitted' ? 'ok' : ''}`}>{item.type}</span>
              </div>
              <p>{item.note}</p>
              <small>{item.createdAt}</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
