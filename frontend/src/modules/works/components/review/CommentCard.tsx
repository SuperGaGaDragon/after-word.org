import { AnalysisComment } from '../../types/workContract';
import './CommentCard.css';

type FAOCommentCardProps = {
  comment: string;
};

export function FAOCommentCard({ comment }: FAOCommentCardProps) {
  return (
    <div className="comment-card fao-comment-card">
      <div className="comment-card-header">
        <h4 className="comment-card-title">Overall Assessment</h4>
        <span className="comment-card-badge fao">FAO</span>
      </div>
      <div className="comment-card-body">
        <p className="comment-text">{comment}</p>
      </div>
    </div>
  );
}

type ReflectionCommentCardProps = {
  comment: string;
};

export function ReflectionCommentCard({ comment }: ReflectionCommentCardProps) {
  return (
    <div className="comment-card reflection-comment-card">
      <div className="comment-card-header">
        <h4 className="comment-card-title">Reflection Feedback</h4>
        <span className="comment-card-badge reflection">Response</span>
      </div>
      <div className="comment-card-body">
        <p className="comment-text">{comment}</p>
      </div>
    </div>
  );
}

type SentenceCommentCardProps = {
  comment: AnalysisComment;
  marking?: {
    action: 'resolved' | 'rejected';
    userNote?: string;
  };
  locked: boolean;
  onMarkAction: (action: 'resolved' | 'rejected') => void;
  onNoteChange: (note: string) => void;
  onHighlight?: () => void;
  isActive?: boolean;
};

export function SentenceCommentCard({
  comment,
  marking,
  locked,
  onMarkAction,
  onNoteChange,
  onHighlight,
  isActive
}: SentenceCommentCardProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'severity-high';
      case 'low':
        return 'severity-low';
      default:
        return 'severity-medium';
    }
  };

  return (
    <div
      className={`comment-card sentence-comment-card ${isActive ? 'active' : ''}`}
      onClick={onHighlight}
    >
      <div className="comment-card-header">
        <h4 className="comment-card-title">{comment.title}</h4>
        <span className={`comment-card-badge ${getSeverityColor(comment.severity)}`}>
          {comment.severity}
        </span>
      </div>

      <div className="comment-card-body">
        {comment.originalText && (
          <div className="original-text">
            <strong>Text:</strong> "{comment.originalText}"
          </div>
        )}

        <div className="comment-section">
          <strong>Issue:</strong>
          <p className="comment-text">{comment.description}</p>
        </div>

        <div className="comment-section">
          <strong>Suggestion:</strong>
          <p className="comment-text suggestion">{comment.suggestion}</p>
        </div>

        {comment.improvementFeedback && (
          <div className="comment-section improvement-feedback">
            <strong>Improvement Feedback:</strong>
            <p className="comment-text">{comment.improvementFeedback}</p>
          </div>
        )}
      </div>

      <div className="comment-card-actions">
        <button
          type="button"
          className={`action-btn resolve-btn ${marking?.action === 'resolved' ? 'active' : ''}`}
          disabled={locked}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAction('resolved');
          }}
        >
          {marking?.action === 'resolved' ? '✓ Resolved' : 'Resolve'}
        </button>
        <button
          type="button"
          className={`action-btn reject-btn ${marking?.action === 'rejected' ? 'active' : ''}`}
          disabled={locked}
          onClick={(e) => {
            e.stopPropagation();
            onMarkAction('rejected');
          }}
        >
          {marking?.action === 'rejected' ? '✓ Rejected' : 'Reject'}
        </button>
      </div>

      {marking?.action === 'resolved' && (
        <div className="comment-card-note">
          <label htmlFor={`note-${comment.id}`}>
            <strong>Your note:</strong>
          </label>
          <textarea
            id={`note-${comment.id}`}
            className="note-input"
            rows={2}
            value={marking.userNote || ''}
            disabled={locked}
            placeholder="Optional: Explain how you addressed this..."
            onChange={(e) => {
              e.stopPropagation();
              onNoteChange(e.target.value);
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
