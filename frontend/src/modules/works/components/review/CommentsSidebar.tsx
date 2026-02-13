import { WorkVersionDetail } from '../../types/workContract';
import { FAOCommentCard, ReflectionCommentCard, SentenceCommentCard } from './CommentCard';
import './CommentsSidebar.css';

type CommentsSidebarProps = {
  baselineVersion: WorkVersionDetail | null;
  suggestionMarkings: Record<string, { action: 'resolved' | 'rejected'; userNote?: string }>;
  unprocessedCount: number;
  locked: boolean;
  activeCommentId?: string;
  onMarkAction: (commentId: string, action: 'resolved' | 'rejected') => void;
  onNoteChange: (commentId: string, note: string) => void;
  onCommentClick?: (commentId: string) => void;
};

export function CommentsSidebar({
  baselineVersion,
  suggestionMarkings,
  unprocessedCount,
  locked,
  activeCommentId,
  onMarkAction,
  onNoteChange,
  onCommentClick
}: CommentsSidebarProps) {
  if (!baselineVersion?.analysis) {
    return (
      <div className="comments-sidebar">
        <div className="sidebar-header">
          <h3>Analysis</h3>
        </div>
        <div className="sidebar-empty">
          <p>No analysis yet.</p>
          <p className="sidebar-hint">Submit your work to receive AI feedback.</p>
        </div>
      </div>
    );
  }

  const { reflectionComment, sentenceComments } = baselineVersion.analysis;

  return (
    <div className="comments-sidebar">
      <div className="sidebar-header">
        <h3>Analysis</h3>
        {unprocessedCount > 0 && (
          <span className="unprocessed-badge">{unprocessedCount} to review</span>
        )}
      </div>

      <div className="sidebar-content">
        {/* Reflection Comment - only if exists */}
        {reflectionComment && <ReflectionCommentCard comment={reflectionComment} />}

        {/* Sentence Comments */}
        {sentenceComments.length > 0 && (
          <div className="sentence-comments-section">
            <h4 className="section-title">
              Sentence-Level Comments ({sentenceComments.length})
            </h4>
            {sentenceComments.map((comment) => (
              <SentenceCommentCard
                key={comment.id}
                comment={comment}
                marking={suggestionMarkings[comment.id]}
                locked={locked}
                isActive={activeCommentId === comment.id}
                onMarkAction={(action) => onMarkAction(comment.id, action)}
                onNoteChange={(note) => onNoteChange(comment.id, note)}
                onHighlight={() => onCommentClick?.(comment.id)}
              />
            ))}
          </div>
        )}

        {sentenceComments.length === 0 && (
          <div className="no-sentence-comments">
            <p>No sentence-level comments.</p>
          </div>
        )}
      </div>
    </div>
  );
}
