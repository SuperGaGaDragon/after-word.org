import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { ReactNode, useState } from 'react';
import './WorkInfoDialog.css';

type WorkInfoDialogProps = {
  workId: string;
  createdAt: string;
  updatedAt: string;
  onDelete: (workId: string) => void;
  children: ReactNode;
};

export function WorkInfoDialog({
  workId,
  createdAt,
  updatedAt,
  onDelete,
  children
}: WorkInfoDialogProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  function formatDate(isoString: string): string {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function handleDelete() {
    onDelete(workId);
    setDeleteDialogOpen(false);
  }

  return (
    <>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger asChild>{children}</DropdownMenu.Trigger>

        <DropdownMenu.Portal>
          <DropdownMenu.Content className="work-info-content" sideOffset={5} align="end">
            <div className="work-info-section">
              <div className="work-info-item">
                <span className="work-info-label">Created at:</span>
                <span className="work-info-value">{formatDate(createdAt)}</span>
              </div>
              <div className="work-info-item">
                <span className="work-info-label">Last modified:</span>
                <span className="work-info-value">{formatDate(updatedAt)}</span>
              </div>
            </div>

            <DropdownMenu.Separator className="work-info-separator" />

            <DropdownMenu.Item
              className="work-info-delete"
              onSelect={() => setDeleteDialogOpen(true)}
            >
              Delete
            </DropdownMenu.Item>

            <DropdownMenu.Arrow className="work-info-arrow" />
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>

      <AlertDialog.Root open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialog.Portal>
          <AlertDialog.Overlay className="delete-dialog-overlay" />
          <AlertDialog.Content className="delete-dialog-content">
            <AlertDialog.Title className="delete-dialog-title">Delete Work?</AlertDialog.Title>
            <AlertDialog.Description className="delete-dialog-description">
              This action cannot be undone. This will permanently delete this work and all its
              versions.
            </AlertDialog.Description>

            <div className="delete-dialog-actions">
              <AlertDialog.Cancel asChild>
                <button type="button" className="delete-dialog-btn-cancel">
                  Cancel
                </button>
              </AlertDialog.Cancel>
              <AlertDialog.Action asChild>
                <button type="button" className="delete-dialog-btn-delete" onClick={handleDelete}>
                  Delete
                </button>
              </AlertDialog.Action>
            </div>
          </AlertDialog.Content>
        </AlertDialog.Portal>
      </AlertDialog.Root>
    </>
  );
}
