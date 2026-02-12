import { useMemo, useState } from 'react'
import { faoComment, sentenceComments } from '../data'
import { Resolution, SentenceComment } from '../types'

export default function FeedbackPage() {
  const [rows, setRows] = useState(sentenceComments)
  const [reflection, setReflection] = useState('I will strengthen causal evidence and trim vague claims.')

  const pendingCount = useMemo(() => rows.filter((r) => r.resolution === 'Pending').length, [rows])

  function setResolution(id: string, resolution: Resolution) {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, resolution } : row)),
    )
  }

  return (
    <section className="page">
      <header className="page-head">
        <p className="eyebrow">AI Review Layer</p>
        <h2>Feedback orchestration before next submission</h2>
      </header>

      <article className="panel">
        <h3>FAO Comment</h3>
        <p className="lead">{faoComment}</p>
      </article>

      <article className="panel">
        <div className="panel-head">
          <h3>Sentence Comments</h3>
          <span className={`pill ${pendingCount === 0 ? 'ok' : 'warn'}`}>
            {pendingCount === 0 ? 'Ready to submit' : `${pendingCount} pending`}
          </span>
        </div>
        <div className="table-list">
          {rows.map((row) => (
            <CommentCard key={row.id} row={row} onResolve={setResolution} />
          ))}
        </div>
      </article>

      <article className="panel">
        <h3>Reflection</h3>
        <textarea
          value={reflection}
          onChange={(event) => setReflection(event.target.value)}
          maxLength={220}
          placeholder="Write your strategy for the next revision..."
        />
        <small>{reflection.length}/220 chars</small>
      </article>
    </section>
  )
}

function CommentCard({
  row,
  onResolve,
}: {
  row: SentenceComment
  onResolve: (id: string, resolution: Resolution) => void
}) {
  return (
    <div className="comment-card">
      <div>
        <p className="sentence">“{row.sentence}”</p>
        <p>{row.comment}</p>
        <small>
          {row.type} · {row.severity} · Last result: {row.improvement}
        </small>
      </div>
      <div className="pill-wrap">
        <button onClick={() => onResolve(row.id, 'Resolved')}>Resolved</button>
        <button className="ghost" onClick={() => onResolve(row.id, 'Rejected')}>
          Reject
        </button>
      </div>
    </div>
  )
}
