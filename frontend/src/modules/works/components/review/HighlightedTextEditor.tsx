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

    // Sort comments by start index
    const sortedComments = [...comments].sort((a, b) => {
      const aStart = a.startIndex ?? 0;
      const bStart = b.startIndex ?? 0;
      return aStart - bStart;
    });

    const result: HighlightSegment[] = [];
    let currentPos = 0;

    for (const comment of sortedComments) {
      const start = comment.startIndex ?? 0;
      const end = comment.endIndex ?? content.length;

      // Add text before this comment
      if (currentPos < start) {
        result.push({
          text: content.slice(currentPos, start),
          startIndex: currentPos,
          endIndex: start
        });
      }

      // Add highlighted text
      if (start < end && end <= content.length) {
        result.push({
          text: content.slice(start, end),
          commentId: comment.id,
          severity: comment.severity,
          startIndex: start,
          endIndex: end
        });
        currentPos = end;
      }
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

  const handleSegmentClick = (commentId?: string) => {
    if (commentId && onCommentClick) {
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
                  onClick={() => handleSegmentClick(segment.commentId)}
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
                onClick={() => handleSegmentClick(segment.commentId)}
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
