import { FormEvent, useMemo, useState } from 'react';
import { WorkVersionDetail, WorkVersionSummary } from '../types/workContract';

type WorkDetailPanelProps = {
  content: string;
  workId?: string;
  versions: WorkVersionSummary[];
  selectedVersion: WorkVersionDetail | null;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  reverting: boolean;
  locked: boolean;
  lockRetryInSec: number;
  error: string | null;
  info: string | null;
  onContentChange: (value: string) => void;
  onSaveAuto: () => void;
  onSaveDraft: () => void;
  onSubmit: (
    faoReflection: string,
    suggestionActions: Record<string, { action: 'resolved' | 'rejected'; userNote?: string }>
  ) => void;
  onOpenVersion: (versionNumber: number) => void;
  onRevert: (versionNumber: number) => void;
};

export function WorkDetailPanel({
  content,
  workId,
  versions,
  selectedVersion,
  loading,
  saving,
  submitting,
  reverting,
  locked,
  lockRetryInSec,
  error,
  info,
  onContentChange,
  onSaveAuto,
  onSaveDraft,
  onSubmit,
  onOpenVersion,
  onRevert
}: WorkDetailPanelProps) {
  const [commentId, setCommentId] = useState('');
  const [action, setAction] = useState<'resolved' | 'rejected'>('resolved');
  const [note, setNote] = useState('');
  const [faoReflection, setFaoReflection] = useState('');

  const suggestionActions = useMemo(() => {
    const trimmedId = commentId.trim();
    if (!trimmedId) {
      return {};
    }

    return {
      [trimmedId]: {
        action,
        userNote: note
      }
    };
  }, [action, commentId, note]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit(faoReflection, suggestionActions);
  }

  return (
    <section className="work-detail-panel" aria-label="work detail panel">
      <h2>Editor</h2>
      <p>Work ID: {workId ?? ''}</p>

      {loading && <p>Loading work detail...</p>}
      {locked && (
        <p className="lock-banner">
          Locked by another device. Read-only mode active. Retrying refresh in {lockRetryInSec}s.
        </p>
      )}
      {error && <p className="contract-error">{error}</p>}
      {info && <p className="contract-info">{info}</p>}

      <label htmlFor="work-editor-content">Content</label>
      <textarea
        id="work-editor-content"
        rows={10}
        value={content}
        readOnly={locked}
        onChange={(event) => onContentChange(event.target.value)}
      />

      <div className="contract-actions">
        <button type="button" onClick={onSaveAuto} disabled={!workId || saving || locked}>
          Auto Save
        </button>
        <button type="button" onClick={onSaveDraft} disabled={!workId || saving || locked}>
          Save Draft Version
        </button>
      </div>

      {/* TEST ONLY: suggestion mapping form validates submit payload contract. */}
      <form onSubmit={handleSubmit} className="contract-grid-form">
        <h3>Submit Contract Inputs</h3>

        <label htmlFor="submit-comment-id">Comment ID</label>
        <input
          id="submit-comment-id"
          type="text"
          value={commentId}
          disabled={locked}
          onChange={(event) => setCommentId(event.target.value)}
          placeholder="suggestion_uuid"
        />

        <label htmlFor="submit-action">Action</label>
        <select
          id="submit-action"
          value={action}
          disabled={locked}
          onChange={(event) => setAction(event.target.value as 'resolved' | 'rejected')}
        >
          <option value="resolved">resolved</option>
          <option value="rejected">rejected</option>
        </select>

        <label htmlFor="submit-note">User Note</label>
        <input
          id="submit-note"
          type="text"
          value={note}
          disabled={locked}
          onChange={(event) => setNote(event.target.value)}
          placeholder="optional"
        />

        <label htmlFor="submit-fao-reflection">FAO Reflection</label>
        <textarea
          id="submit-fao-reflection"
          rows={3}
          value={faoReflection}
          disabled={locked}
          onChange={(event) => setFaoReflection(event.target.value)}
          placeholder="optional reflection"
        />

        <button type="submit" disabled={!workId || submitting || locked}>
          Submit + Fetch Analysis
        </button>
      </form>

      <section>
        <h3>Versions</h3>
        {versions.length === 0 && <p>No versions yet.</p>}
        {versions.length > 0 && (
          <ul className="version-list">
            {versions.map((version) => (
              <li key={version.versionNumber} className="version-item">
                <div>
                  <strong>v{version.versionNumber}</strong>
                  <p>{version.changeType}</p>
                </div>
                <div className="version-actions">
                  <button type="button" onClick={() => onOpenVersion(version.versionNumber)}>
                    Open
                  </button>
                  <button
                    type="button"
                    onClick={() => onRevert(version.versionNumber)}
                    disabled={reverting || locked}
                  >
                    Revert
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {selectedVersion && (
        <section className="selected-version">
          <h3>Selected Version: v{selectedVersion.versionNumber}</h3>
          <p>{selectedVersion.changeType}</p>
          <p>{selectedVersion.content.slice(0, 240)}</p>
          {selectedVersion.analysis && (
            <div>
              <h4>Analysis</h4>
              <p>{selectedVersion.analysis.faoComment}</p>
              <p>Sentence comments: {selectedVersion.analysis.sentenceComments.length}</p>
            </div>
          )}
        </section>
      )}
    </section>
  );
}
