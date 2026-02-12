import { Pencil1Icon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { useNavigate } from 'react-router-dom';
import { WorkInfoDialog } from '../dialogbox/WorkInfoDialog';
import { EditableTitle } from './EditableTitle';
import { renameWork } from '../../modules/works/api/workApi';
import './WorkCard.css';

export type WorkCardProps = {
  workId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  onDelete: (workId: string) => void;
  onRename?: (workId: string, newTitle: string) => void;
};

export function WorkCard({ workId, title, createdAt, updatedAt, onDelete, onRename }: WorkCardProps) {
  const navigate = useNavigate();

  const handleRename = async (newTitle: string) => {
    await renameWork(workId, newTitle);
    if (onRename) {
      onRename(workId, newTitle);
    }
  };

  const handleTitleClick = (e: React.MouseEvent) => {
    // Only navigate on single click, not when editing
    const target = e.target as HTMLElement;
    if (!target.classList.contains('editable-title-input')) {
      navigate(`/works/${workId}`);
    }
  };

  return (
    <div className="work-card">
      <div className="work-card-header">
        <Pencil1Icon className="work-card-icon" />
        <WorkInfoDialog
          workId={workId}
          createdAt={createdAt}
          updatedAt={updatedAt}
          onDelete={onDelete}
        >
          <button type="button" className="work-card-menu-btn" aria-label="Work options">
            <DotsVerticalIcon />
          </button>
        </WorkInfoDialog>
      </div>
      <div className="work-card-title-wrapper" onClick={handleTitleClick}>
        <h3 className="work-card-title">
          <EditableTitle
            title={title}
            placeholder="Untitled Work"
            onRename={handleRename}
          />
        </h3>
      </div>
    </div>
  );
}
