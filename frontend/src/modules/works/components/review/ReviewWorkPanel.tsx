import { useState, useMemo, useEffect } from 'react';
import { WorkVersionDetail } from '../../types/workContract';
import { HighlightedTextEditor } from './HighlightedTextEditor';
import { CommentsSidebar } from './CommentsSidebar';
import { EditableTitle } from '../../../../components/modal/EditableTitle';
import { getVersionList } from '../../api/workApi';
import { countWords } from '../../../../utils/wordCount';
import './ReviewWorkPanel.css';

type ReviewWorkPanelProps = {
  workId?: string;
  title: string;
  onRename: (newTitle: string) => Promise<void>;
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
  title,
  onRename,
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
  const [showReflectionEditor, setShowReflectionEditor] = useState(false);
  const [showVersionDropdown, setShowVersionDropdown] = useState(false);
  const [submittedVersions, setSubmittedVersions] = useState<Array<{ versionNumber: number; createdAt: string }>>([]);

  const essayPromptWordCount = useMemo(() => countWords(essayPrompt), [essayPrompt]);
  const contentWordCount = useMemo(() => countWords(content), [content]);
  const reflectionWordCount = useMemo(() => countWords(faoReflectionDraft), [faoReflectionDraft]);

  const sentenceComments = baselineSubmittedVersion?.analysis?.sentenceComments || [];

  useEffect(() => {
    if (workId && showVersionDropdown && submittedVersions.length === 0) {
      void loadSubmittedVersions();
    }
  }, [showVersionDropdown, workId]);

  const loadSubmittedVersions = async () => {
    if (!workId) return;
    try {
      const versionList = await getVersionList(workId, 'submitted');
      const submitted = versionList.versions.filter((v) => v.isSubmitted);
      setSubmittedVersions(
        submitted.map((v) => ({
          versionNumber: v.versionNumber,
          createdAt: v.createdAt
        }))
      );
    } catch (error) {
      console.error('Failed to load submitted versions:', error);
    }
  };

  const handleCommentClick = (commentId: string) => {
    setActiveCommentId(commentId === activeCommentId ? undefined : commentId);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  const handleVersionClick = (versionNumber: number) => {
    if (workId) {
      window.open(`/work/${workId}?version=${versionNumber}`, '_blank');
    }
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
          <h1 className="work-title">
            <EditableTitle
              title={title}
              placeholder="Untitled Work"
              onRename={onRename}
            />
          </h1>
          {currentVersionNumber && (
            <div className="version-dropdown-container">
              <button
                type="button"
                className="version-badge clickable"
                onClick={() => setShowVersionDropdown(!showVersionDropdown)}
              >
                v{currentVersionNumber} ▾
              </button>
              {showVersionDropdown && (
                <div className="version-dropdown">
                  {submittedVersions.length === 0 ? (
                    <div className="version-dropdown-item disabled">No submitted versions</div>
                  ) : (
                    submittedVersions.map((version) => (
                      <button
                        key={version.versionNumber}
                        type="button"
                        className="version-dropdown-item"
                        onClick={() => {
                          handleVersionClick(version.versionNumber);
                          setShowVersionDropdown(false);
                        }}
                      >
                        <span className="version-number">v{version.versionNumber}</span>
                        <span className="version-date">
                          {new Date(version.createdAt).toLocaleDateString()}
                        </span>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
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

      {/* Overall Assessment Section */}
      {baselineSubmittedVersion?.analysis?.faoComment && (
        <div className="overall-assessment-section">
          <h3 className="assessment-title">Overall Assessment</h3>
          <div className="assessment-content">
            <p>{baselineSubmittedVersion.analysis.faoComment}</p>
          </div>
          {!showReflectionEditor && (
            <button
              type="button"
              className="btn-write-reflection"
              onClick={() => setShowReflectionEditor(true)}
            >
              Write My Reflection
            </button>
          )}
        </div>
      )}

      {/* Submit Section */}
      <div className="submit-section">
        <form onSubmit={handleSubmit}>
          {showReflectionEditor && (
            <div className="reflection-section">
              <div className="reflection-header">
                <label htmlFor="fao-reflection" className="section-label">
                  FAO Reflection (Optional)
                  <span className="word-count-badge">{reflectionWordCount} words</span>
                </label>
                <button
                  type="button"
                  className="btn-close-reflection"
                  onClick={() => setShowReflectionEditor(false)}
                  aria-label="Hide reflection"
                >
                  ✕
                </button>
              </div>
              <textarea
                id="fao-reflection"
                className="reflection-textarea"
                rows={3}
                value={faoReflectionDraft}
                readOnly={locked}
                onChange={(e) => onFaoReflectionChange(e.target.value)}
                placeholder="Reflect on your revision process and what you learned..."
              />
            </div>
          )}
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
