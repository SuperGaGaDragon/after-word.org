import { useState, useMemo } from 'react';
import { WorkVersionDetail } from '../../types/workContract';
import { HighlightedTextEditor } from './HighlightedTextEditor';
import { CommentsSidebar } from './CommentsSidebar';
import { EditableTitle } from '../../../../components/modal/EditableTitle';
import { countWords } from '../../../../utils/wordCount';
import './ReviewWorkPanel.css';

type VersionViewPanelProps = {
  workId?: string;
  title: string;
  versionDetail: WorkVersionDetail;
  onRename: (newTitle: string) => Promise<void>;
};

export function VersionViewPanel({
  workId,
  title,
  versionDetail,
  onRename
}: VersionViewPanelProps) {
  const [activeCommentId, setActiveCommentId] = useState<string | undefined>();
  const [showPromptEditor, setShowPromptEditor] = useState(false);

  const essayPromptWordCount = useMemo(() => countWords(''), []);
  const contentWordCount = useMemo(() => countWords(versionDetail.content), [versionDetail.content]);

  const sentenceComments = versionDetail.analysis?.sentenceComments || [];

  const handleCommentClick = (commentId: string) => {
    setActiveCommentId(commentId === activeCommentId ? undefined : commentId);
  };

  return (
    <div className="review-work-panel">
      {/* Version Header */}
      <div className="version-view-header-inline">
        <div className="work-info">
          <h1 className="work-title">
            <EditableTitle
              title={title}
              placeholder="Untitled Work"
              onRename={onRename}
            />
          </h1>
          {versionDetail.versionNumber && (
            <span className="version-badge">v{versionDetail.versionNumber}</span>
          )}
        </div>
        <div className="version-actions">
          <span className="version-date">
            {new Date(versionDetail.createdAt).toLocaleDateString()}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowPromptEditor(!showPromptEditor)}
          >
            {showPromptEditor ? 'Hide Prompt' : 'See Prompt'}
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
            value=""
            readOnly={true}
            placeholder="No essay prompt for this version"
          />
        </div>
      )}

      {/* Info Message */}
      <div className="status-bar">
        <div className="status-message info-message" role="status">
          This is a read-only view of a previous version
        </div>
      </div>

      {/* Main Review Area */}
      <div className="review-area">
        {/* Left: Content Editor */}
        <div className="content-section">
          <div className="section-label">
            Content
            <span className="word-count-badge">{contentWordCount} words</span>
          </div>
          <HighlightedTextEditor
            content={versionDetail.content}
            comments={sentenceComments}
            readOnly={true}
            onChange={() => {}}
            onCommentClick={handleCommentClick}
          />
        </div>

        {/* Right: Comments Sidebar */}
        <div className="sidebar-section">
          <CommentsSidebar
            baselineVersion={versionDetail}
            suggestionMarkings={{}}
            unprocessedCount={0}
            locked={true}
            activeCommentId={activeCommentId}
            onMarkAction={() => {}}
            onNoteChange={() => {}}
            onCommentClick={handleCommentClick}
          />
        </div>
      </div>

      {/* Overall Assessment Section */}
      {versionDetail.analysis?.faoComment && (
        <div className="overall-assessment-section">
          <h3 className="assessment-title">Overall Assessment</h3>
          <div className="assessment-content">
            <p>{versionDetail.analysis.faoComment}</p>
          </div>
        </div>
      )}

      {/* User Reflection if exists */}
      {versionDetail.userReflection && (
        <div className="submit-section">
          <div className="reflection-section">
            <div className="reflection-header">
              <label className="section-label">User Reflection</label>
            </div>
            <textarea
              className="reflection-textarea"
              rows={3}
              value={versionDetail.userReflection}
              readOnly={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
