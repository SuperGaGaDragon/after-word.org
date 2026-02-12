import { FormEvent, useState } from 'react';
import { WorkVersionDetail, WorkVersionSummary } from '../types/workContract';

type WorkDetailPanelProps = {
  content: string;
  faoReflectionDraft: string;
  currentVersionNumber?: number;
  workId?: string;
  versions: WorkVersionSummary[];
  hiddenVersionCount: number;
  canLoadMoreVersions: boolean;
  selectedVersion: WorkVersionDetail | null;
  baselineSubmittedVersion: WorkVersionDetail | null;
  suggestionMarkings: Record<string, { action: 'resolved' | 'rejected'; userNote?: string }>;
  unprocessedCommentCount: number;
  loading: boolean;
  saving: boolean;
  submitting: boolean;
  reverting: boolean;
  locked: boolean;
  lockRetryInSec: number;
  error: string | null;
  info: string | null;
  onContentChange: (value: string) => void;
  onFaoReflectionChange: (value: string) => void;
  onSaveAuto: () => void;
  onSaveDraft: () => Promise<void>;
  onSubmit: () => void;
  onOpenVersion: (versionNumber: number) => void;
  onLoadMoreVersions: () => void;
  onRevert: (versionNumber: number) => Promise<void>;
  onMarkSuggestionAction: (commentId: string, action: 'resolved' | 'rejected') => void;
  onSuggestionNoteChange: (commentId: string, note: string) => void;
};

export function WorkDetailPanel({
  content,
  faoReflectionDraft,
  currentVersionNumber,
  workId,
  versions,
  hiddenVersionCount,
  canLoadMoreVersions,
  selectedVersion,
  baselineSubmittedVersion,
  suggestionMarkings,
  unprocessedCommentCount,
  loading,
  saving,
  submitting,
  reverting,
  locked,
  lockRetryInSec,
  error,
  info,
  onContentChange,
  onFaoReflectionChange,
  onSaveAuto,
  onSaveDraft,
  onSubmit,
  onOpenVersion,
  onLoadMoreVersions,
  onRevert,
  onMarkSuggestionAction,
  onSuggestionNoteChange
}: WorkDetailPanelProps) {
  const [pendingRevertVersion, setPendingRevertVersion] = useState<number | null>(null);
  const [confirmBusy, setConfirmBusy] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onSubmit();
  }

  async function handleSaveCurrentFirst() {
    if (pendingRevertVersion === null) {
      return;
    }
    setConfirmBusy(true);
    try {
      await onSaveDraft();
      await onRevert(pendingRevertVersion);
      setPendingRevertVersion(null);
    } finally {
      setConfirmBusy(false);
    }
  }

  async function handleRevertAnyway() {
    if (pendingRevertVersion === null) {
      return;
    }
    setConfirmBusy(true);
    try {
      await onRevert(pendingRevertVersion);
      setPendingRevertVersion(null);
    } finally {
      setConfirmBusy(false);
    }
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
      {error && (
        <p className="contract-error" aria-live="polite">
          {error}
        </p>
      )}
      {info && (
        <p className="contract-info" aria-live="polite">
          {info}
        </p>
      )}

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

      <section className="analysis-section">
        <h3>Current Submission Review Queue</h3>
        {!baselineSubmittedVersion?.analysis && (
          <p>No prior submitted analysis. First submit can proceed directly.</p>
        )}
        {baselineSubmittedVersion?.analysis && (
          <>
            <p>Unprocessed sentence comments: {unprocessedCommentCount}</p>
            <ul className="comment-list">
              {baselineSubmittedVersion.analysis.sentenceComments.map((comment) => {
                const marking = suggestionMarkings[comment.id];
                return (
                  <li key={comment.id} className="comment-item">
                    <strong>{comment.title}</strong>
                    <p>{comment.description}</p>
                    <p>{comment.suggestion}</p>
                    <div className="contract-actions">
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onMarkSuggestionAction(comment.id, 'resolved')}
                      >
                        {marking?.action === 'resolved' ? 'Resolved ✓' : 'Mark Resolved'}
                      </button>
                      <button
                        type="button"
                        disabled={locked}
                        onClick={() => onMarkSuggestionAction(comment.id, 'rejected')}
                      >
                        {marking?.action === 'rejected' ? 'Rejected ✓' : 'Reject'}
                      </button>
                    </div>
                    <input
                      type="text"
                      value={marking?.userNote ?? ''}
                      disabled={locked || marking?.action !== 'resolved'}
                      placeholder="Optional note when resolved"
                      onChange={(event) => onSuggestionNoteChange(comment.id, event.target.value)}
                    />
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </section>

      <form onSubmit={handleSubmit} className="contract-grid-form">
        <h3>Submit</h3>
        <label htmlFor="submit-fao-reflection">FAO Reflection</label>
        <textarea
          id="submit-fao-reflection"
          rows={3}
          value={faoReflectionDraft}
          disabled={locked}
          onChange={(event) => onFaoReflectionChange(event.target.value)}
          placeholder="optional reflection"
        />

        <button type="submit" disabled={!workId || submitting || locked}>
          Submit + Fetch Analysis
        </button>
      </form>

      <section>
        <h3>Versions</h3>
        {hiddenVersionCount > 0 && (
          <p>Showing latest {versions.length} versions. {hiddenVersionCount} older versions hidden.</p>
        )}
        {canLoadMoreVersions && (
          <button type="button" onClick={onLoadMoreVersions}>
            Load Older Versions
          </button>
        )}
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
                    onClick={() => setPendingRevertVersion(version.versionNumber)}
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
          <p>{selectedVersion.content.slice(0, 300)}</p>
          {selectedVersion.analysis && (
            <div className="analysis-details">
              <h4>FAO Comment</h4>
              <p>{selectedVersion.analysis.faoComment}</p>

              {selectedVersion.analysis.reflectionComment && (
                <>
                  <h4>Reflection Comment</h4>
                  <p>{selectedVersion.analysis.reflectionComment}</p>
                </>
              )}

              <h4>Sentence Comments ({selectedVersion.analysis.sentenceComments.length})</h4>
              <ul className="comment-list">
                {selectedVersion.analysis.sentenceComments.map((comment) => (
                  <li key={comment.id} className="comment-item">
                    <strong>{comment.title}</strong>
                    <p>{comment.description}</p>
                    <p>{comment.suggestion}</p>
                    {comment.improvementFeedback && <p>{comment.improvementFeedback}</p>}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      {pendingRevertVersion !== null && (
        <section className="revert-confirm">
          <h3>Revert to Version {pendingRevertVersion}?</h3>
          <p>
            This will create a new draft using content from version {pendingRevertVersion}.
          </p>
          <p>Your current unsaved changes may be lost.</p>
          <p>
            You can undo this by reverting back to version {currentVersionNumber ?? 'current'}.
          </p>
          <div className="contract-actions">
            <button type="button" disabled={confirmBusy} onClick={() => setPendingRevertVersion(null)}>
              Cancel
            </button>
            <button type="button" disabled={confirmBusy} onClick={() => void handleSaveCurrentFirst()}>
              Save Current First
            </button>
            <button type="button" disabled={confirmBusy} onClick={() => void handleRevertAnyway()}>
              Revert Anyway
            </button>
          </div>
        </section>
      )}
    </section>
  );
}
