import { useState } from 'react';
import { useWorkContractActions } from '../hooks/useWorkContractActions';
import { SuggestionActionType } from '../types/workContract';

type Phase2ContractPanelProps = {
  workId?: string;
};

export function Phase2ContractPanel({ workId }: Phase2ContractPanelProps) {
  const { state, runUpdate, runSubmit } = useWorkContractActions(workId);
  const [content, setContent] = useState('');
  const [faoReflection, setFaoReflection] = useState('');
  const [commentId, setCommentId] = useState('');
  const [actionType, setActionType] = useState<SuggestionActionType>('resolved');
  const [userNote, setUserNote] = useState('');

  const suggestionActions = commentId.trim()
    ? {
        [commentId.trim()]: {
          action: actionType,
          userNote
        }
      }
    : {};

  return (
    <section className="contract-panel" aria-label="phase2 contract panel">
      <h2>Phase 2 Contract Test</h2>
      {/* TEST ONLY: this panel verifies API contract mapping and request flow. */}
      <p>
        Uses snake_case payloads, explicit auto_save, and submit-followed-by-version-detail
        fetch.
      </p>

      <label htmlFor="contract-content">Content</label>
      <textarea
        id="contract-content"
        value={content}
        onChange={(event) => setContent(event.target.value)}
        rows={6}
      />

      <div className="contract-actions">
        <button
          type="button"
          onClick={() => runUpdate(content, true)}
          disabled={!workId || state.isSaving}
        >
          Save Auto (auto_save=true)
        </button>
        <button
          type="button"
          onClick={() => runUpdate(content, false)}
          disabled={!workId || state.isSaving}
        >
          Save Draft (auto_save=false)
        </button>
      </div>

      <label htmlFor="contract-reflection">FAO Reflection</label>
      <textarea
        id="contract-reflection"
        value={faoReflection}
        onChange={(event) => setFaoReflection(event.target.value)}
        rows={3}
      />

      <div className="contract-grid">
        <label htmlFor="contract-comment-id">Comment ID</label>
        <input
          id="contract-comment-id"
          type="text"
          value={commentId}
          onChange={(event) => setCommentId(event.target.value)}
          placeholder="suggestion_uuid"
        />

        <label htmlFor="contract-action">Action</label>
        <select
          id="contract-action"
          value={actionType}
          onChange={(event) => setActionType(event.target.value as SuggestionActionType)}
        >
          <option value="resolved">resolved</option>
          <option value="rejected">rejected</option>
        </select>

        <label htmlFor="contract-note">User Note</label>
        <input
          id="contract-note"
          type="text"
          value={userNote}
          onChange={(event) => setUserNote(event.target.value)}
          placeholder="optional note"
        />
      </div>

      <button
        type="button"
        onClick={() => runSubmit(content, faoReflection, suggestionActions)}
        disabled={!workId || state.isSubmitting}
      >
        Submit + Fetch Analysis
      </button>

      {state.lastSavedVersion !== null && (
        <p className="contract-info">Last saved version: {state.lastSavedVersion}</p>
      )}

      {state.lastSubmitResult && (
        <div className="contract-info">
          <p>Submit version: {state.lastSubmitResult.submit.version}</p>
          <p>Analysis ID: {state.lastSubmitResult.submit.analysisId}</p>
          <p>
            Loaded version detail: {state.lastSubmitResult.versionDetail.versionNumber}
          </p>
        </div>
      )}

      {state.errorMessage && <p className="contract-error">{state.errorMessage}</p>}
    </section>
  );
}
