import { useState, useRef, useEffect } from 'react';
import './EditableTitle.css';

export type EditableTitleProps = {
  title: string;
  placeholder?: string;
  onRename: (newTitle: string) => Promise<void>;
  className?: string;
};

export function EditableTitle({ title, placeholder = 'Untitled Work', onRename, className = '' }: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setEditValue(title);
    setIsEditing(true);
  };

  const handleSave = async () => {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      setIsSaving(true);
      try {
        await onRename(trimmed);
      } catch (error) {
        console.error('Failed to rename:', error);
        setEditValue(title);
      } finally {
        setIsSaving(false);
      }
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditValue(title);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancel();
    }
  };

  const handleBlur = () => {
    void handleSave();
  };

  const displayTitle = title || placeholder;

  if (isEditing) {
    return (
      <input
        ref={inputRef}
        type="text"
        className={`editable-title-input ${className}`}
        value={editValue}
        onChange={(e) => setEditValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={isSaving}
      />
    );
  }

  return (
    <span
      className={`editable-title ${className}`}
      onDoubleClick={handleDoubleClick}
      title="Double-click to edit"
    >
      {displayTitle}
    </span>
  );
}
