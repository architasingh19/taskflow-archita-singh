import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Task, User } from '../../types';
import { TaskCardContent } from './TaskCardContent';

interface DraggableTaskCardProps {
  task: Task;
  users: User[];
  onEdit: () => void;
  onDelete: (taskId: string) => void;
  isDragDisabled?: boolean;
  isRecentlyDropped?: boolean;
  isHidden?: boolean;
}

export function DraggableTaskCard({
  task,
  users,
  onEdit,
  onDelete,
  isDragDisabled = false,
  isRecentlyDropped = false,
  isHidden = false,
}: DraggableTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      task,
    },
    disabled: isDragDisabled,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'relative group',
        isDragging && 'opacity-50 z-50',
        isRecentlyDropped && 'animate-drop-in',
        isHidden && 'opacity-0 h-0 overflow-hidden'
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className={cn(
          'absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity z-10',
          isDragDisabled && 'hidden'
        )}
      >
        <GripVertical className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={cn(!isDragDisabled && 'pl-4')}>
        <TaskCardContent
          task={task}
          users={users}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      </div>
    </div>
  );
}
