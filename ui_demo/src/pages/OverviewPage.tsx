import { works } from '../data'

const metrics = [
  { label: 'Active Works', value: '12', trend: '+3 this week' },
  { label: 'Submitted Versions', value: '41', trend: '6 pending review' },
  { label: 'Resolved Comments', value: '83%', trend: '+9% vs last cycle' },
]

export default function OverviewPage() {
  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">Product Demo</p>
        <h2>Modern writing cockpit for iterative improvement</h2>
      </header>

      <div className="metric-grid">
        {metrics.map((metric) => (
          <article key={metric.label} className="panel metric-panel">
            <p>{metric.label}</p>
            <h3>{metric.value}</h3>
            <small>{metric.trend}</small>
          </article>
        ))}
      </div>

      <article className="panel">
        <div className="panel-head">
          <h3>Work Queue</h3>
          <button>Create Work</button>
        </div>
        <div className="table-list">
          {works.map((work) => (
            <div key={work.id} className="row-card">
              <div>
                <strong>{work.title}</strong>
                <p>
                  {work.wordCount} words · Updated {work.updatedAt}
                </p>
              </div>
              <div className="pill-wrap">
                {work.lockedBy ? <span className="pill lock">Locked: {work.lockedBy}</span> : null}
                <span className="pill">{work.status}</span>
              </div>
            </div>
          ))}
        </div>
      </article>
    </section>
  )
}
