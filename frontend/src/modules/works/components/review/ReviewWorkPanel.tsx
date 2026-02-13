import { useState, useMemo } from 'react';
import { WorkVersionDetail } from '../../types/workContract';
import { HighlightedTextEditor } from './HighlightedTextEditor';
import { CommentsSidebar } from './CommentsSidebar';
import { countWords } from '../../../../utils/wordCount';
import './ReviewWorkPanel.css';

type ReviewWorkPanelProps = {
  workId?: string;
  content: string;
  essayPrompt: string;
  faoReflectionDraft: string;
  currentVersionNumber?: number;
  baselineSubmittedVersion: WorkVersionDetail | null;
  suggestionMarkings: Record<string, { action: 'resolved' | 'rejected'; userNote?: string }>;
  unprocessedCommentCount: number;
  locked: boolean;
  saving: boolean;
  submitting: boolean;
  error: string | null;
  info: string | null;
  onContentChange: (value: string) => void;
  onEssayPromptChange: (value: string) => void;
  onFaoReflectionChange: (value: string) => void;
  onSaveAuto: () => void;
  onSaveDraft: () => Promise<void>;
  onSubmit: () => void;
  onMarkSuggestionAction: (commentId: string, action: 'resolved' | 'rejected') => void;
  onSuggestionNoteChange: (commentId: string, note: string) => void;
};

export function ReviewWorkPanel({
  workId,
  content,
  essayPrompt,
  faoReflectionDraft,
  currentVersionNumber,
  baselineSubmittedVersion,
  suggestionMarkings,
  unprocessedCommentCount,
  locked,
  saving,
  submitting,
  error,
  info,
  onContentChange,
  onEssayPromptChange,
  onFaoReflectionChange,
  onSaveAuto,
  onSaveDraft,
  onSubmit,
  onMarkSuggestionAction,
  onSuggestionNoteChange
}: ReviewWorkPanelProps) {
  const [activeCommentId, setActiveCommentId] = useState<string | undefined>();
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const essayPromptWordCount = useMemo(() => countWords(essayPrompt), [essayPrompt]);
  const contentWordCount = useMemo(() => countWords(content), [content]);
  const reflectionWordCount = useMemo(() => countWords(faoReflectionDraft), [faoReflectionDraft]);

  const sentenceComments = baselineSubmittedVersion?.analysis?.sentenceComments || [];

  const handleCommentClick = (commentId: string) => {
    setActiveCommentId(commentId === activeCommentId ? undefined : commentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <div className="review-work-panel">
      {/* Status Bar */}
      {(error || info || locked) && (
        <div className="status-bar">
          {locked && (
            <div className="status-message lock-message">
              🔒 Locked by another device. Read-only mode active.
            </div>
          )}
          {error && (
            <div className="status-message error-message" role="alert">
              {error}
            </div>
          )}
          {info && !error && (
            <div className="status-message info-message" role="status">
              {info}
            </div>
          )}
        </div>
      )}

      {/* Top Controls */}
      <div className="top-controls">
        <div className="work-info">
          <span className="work-id">Work ID: {workId || 'N/A'}</span>
          {currentVersionNumber && (
            <span className="version-badge">v{currentVersionNumber}</span>
          )}
        </div>
        <div className="action-buttons">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
          >
            {showPromptEditor ? 'Hide Prompt' : 'Edit Prompt'}
          </button>
          <button
            type="button"
            className="btn-secondary"
            onClick={onSaveDraft}
            disabled={!workId || saving || locked}
          >
            Save Draft Version
          </button>
        </div>
      </div>

      {/* Essay Prompt - collapsible */}
      {showPromptEditor && (
        <div className="prompt-section">
          <label htmlFor="essay-prompt" className="section-label">
            Essay Prompt / Requirements
            <span className="word-count-badge">{essayPromptWordCount} words</span>
          </label>
          <textarea
            id="essay-prompt"
            className="prompt-textarea"
            rows={3}
            value={essayPrompt}
            readOnly={locked}
            onChange={(e) => onEssayPromptChange(e.target.value)}
            placeholder="Enter your essay prompt or requirements (optional)"
          />
        </div>
      )}

      {/* Main Review Area */}
      <div className="review-area">
        {/* Left: Content Editor */}
        <div className="content-section">
          <div className="section-label">
            Content
            <span className="word-count-badge">{contentWordCount} words</span>
          </div>
          <HighlightedTextEditor
            content={content}
            comments={sentenceComments}
            readOnly={locked}
            onChange={onContentChange}
            onCommentClick={handleCommentClick}
          />
        </div>

        {/* Right: Comments Sidebar */}
        <div className="sidebar-section">
          <CommentsSidebar
            baselineVersion={baselineSubmittedVersion}
            suggestionMarkings={suggestionMarkings}
            unprocessedCount={unprocessedCommentCount}
            locked={locked}
            activeCommentId={activeCommentId}
            onMarkAction={onMarkSuggestionAction}
            onNoteChange={onSuggestionNoteChange}
            onCommentClick={handleCommentClick}
          />
        </div>
      </div>

      {/* Submit Section */}
      <div className="submit-section">
        <form onSubmit={handleSubmit}>
          <label htmlFor="fao-reflection" className="section-label">
            FAO Reflection (Optional)
            <span className="word-count-badge">{reflectionWordCount} words</span>
          </label>
          <textarea
            id="fao-reflection"
            className="reflection-textarea"
            rows={3}
            value={faoReflectionDraft}
            readOnly={locked}
            onChange={(e) => onFaoReflectionChange(e.target.value)}
            placeholder="Reflect on your revision process and what you learned..."
          />
          <div className="submit-actions">
            <div className="submit-info">
              {unprocessedCommentCount > 0 && (
                <span className="warning-text">
                  ⚠️ {unprocessedCommentCount} comment{unprocessedCommentCount > 1 ? 's' : ''} must
                  be marked as resolved or rejected before submitting.
                </span>
              )}
            </div>
            <button
              type="submit"
              className="btn-primary-submit"
              disabled={!workId || submitting || locked}
            >
              {submitting ? 'Submitting...' : 'Submit for Analysis'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
