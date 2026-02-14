import { useMemo } from 'react';
import { AnalysisComment } from '../../types/workContract';
import './HighlightedTextEditor.css';

type HighlightedTextEditorProps = {
  content: string;
  comments: AnalysisComment[];
  readOnly: boolean;
  onChange: (value: string) => void;
  onCommentClick?: (commentId: string) => void;
};

type HighlightSegment = {
  text: string;
  commentId?: string;
  severity?: string;
  startIndex: number;
  endIndex: number;
  matchQuality?: 'exact' | 'not-found';
};

type MatchedComment = {
  comment: AnalysisComment;
  startIndex: number;
  endIndex: number;
  matchQuality: 'exact' | 'not-found';
};

export function HighlightedTextEditor({
  content,
  comments,
  readOnly,
  onChange,
  onCommentClick
}: HighlightedTextEditorProps) {
  const segments = useMemo(() => {
    if (comments.length === 0) {
      return [{ text: content, startIndex: 0, endIndex: content.length }];
    }

    // Find all comments in the content using originalText
    const matches: MatchedComment[] = [];

    for (const comment of comments) {
      if (!comment.originalText) {
        console.warn(`Comment ${comment.id} has no originalText`);
        continue;
      }

      // Try exact match using indexOf
      const exactIndex = content.indexOf(comment.originalText);

      if (exactIndex !== -1) {
        matches.push({
          comment,
          startIndex: exactIndex,
          endIndex: exactIndex + comment.originalText.length,
          matchQuality: 'exact'
        });
      } else {
        console.warn(`Could not find exact match for comment ${comment.id}: "${comment.originalText.substring(0, 50)}..."`);
        // Still track that we couldn't find it
        matches.push({
          comment,
          startIndex: -1,
          endIndex: -1,
          matchQuality: 'not-found'
        });
      }
    }

    // Filter out not-found matches and sort by position
    const validMatches = matches.filter(m => m.startIndex !== -1).sort((a, b) => a.startIndex - b.startIndex);

    // Build segments from valid matches
    const result: HighlightSegment[] = [];
    let currentPos = 0;

    for (const match of validMatches) {
      // Add text before this match
      if (currentPos < match.startIndex) {
        result.push({
          text: content.slice(currentPos, match.startIndex),
          startIndex: currentPos,
          endIndex: match.startIndex
        });
      }

      // Add highlighted text
      result.push({
        text: content.slice(match.startIndex, match.endIndex),
        commentId: match.comment.id,
        severity: match.comment.severity,
        startIndex: match.startIndex,
        endIndex: match.endIndex,
        matchQuality: match.matchQuality
      });
      currentPos = match.endIndex;
    }

    // Add remaining text
    if (currentPos < content.length) {
      result.push({
        text: content.slice(currentPos),
        startIndex: currentPos,
        endIndex: content.length
      });
    }

    return result;
  }, [content, comments]);

  const handleSegmentClick = (e: React.MouseEvent, commentId?: string) => {
    if (commentId && onCommentClick) {
      e.stopPropagation(); // Prevent triggering parent onClick
      onCommentClick(commentId);
    }
  };

  if (readOnly) {
    return (
      <div className="highlighted-text-editor readonly">
        <div className="text-content">
          {segments.map((segment, index) => {
            if (segment.commentId) {
              return (
                <span
                  key={index}
                  className={`highlight highlight-${segment.severity || 'medium'}`}
                  data-comment-id={segment.commentId}
                  onClick={(e) => handleSegmentClick(e, segment.commentId)}
                  title="Click to view comment"
                >
                  {segment.text}
                </span>
              );
            }
            return <span key={index}>{segment.text}</span>;
          })}
        </div>
      </div>
    );
  }

  return (
    <div className="highlighted-text-editor editable">
      <textarea
        className="editor-textarea"
        value={content}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Start writing your content here..."
      />
      <div className="text-overlay">
        {segments.map((segment, index) => {
          if (segment.commentId) {
            return (
              <span
                key={index}
                className={`highlight highlight-${segment.severity || 'medium'}`}
                data-comment-id={segment.commentId}
                onClick={(e) => handleSegmentClick(e, segment.commentId)}
              >
                {segment.text}
              </span>
            );
          }
          return <span key={index}>{segment.text}</span>;
        })}
      </div>
    </div>
  );
}
