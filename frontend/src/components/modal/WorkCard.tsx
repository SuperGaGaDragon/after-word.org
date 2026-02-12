import { Pencil1Icon, DotsVerticalIcon } from '@radix-ui/react-icons';
import { Link } from 'react-router-dom';
import { WorkInfoDialog } from '../dialogbox/WorkInfoDialog';
import './WorkCard.css';

export type WorkCardProps = {
  workId: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  onDelete: (workId: string) => void;
};

export function WorkCard({ workId, title, createdAt, updatedAt, onDelete }: WorkCardProps) {
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
      <Link to={`/works/${workId}`} className="work-card-link">
        <h3 className="work-card-title">{title}</h3>
      </Link>
    </div>
  );
}
