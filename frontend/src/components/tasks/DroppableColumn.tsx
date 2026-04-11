import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { cn } from '../../lib/utils';
import { Card, CardContent } from '../ui/card';
import { DraggableTaskCard } from './DraggableTaskCard';
import type { Task, TaskStatus, User } from '../../types';

interface DroppableColumnProps {
  id: TaskStatus;
  title: string;
  tasks: Task[];
  users: User[];
  titleClassName?: string;
  countClassName?: string;
  borderClassName?: string;
  onEditTask: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
  isDragging?: boolean;
  recentlyDroppedId?: string | null;
  isColumnActive?: boolean;
  hiddenTaskId?: string | null;
}

export function DroppableColumn({
  id,
  title,
  tasks,
  users,
  titleClassName,
  countClassName,
  borderClassName,
  onEditTask,
  onTaskDeleted,
  isDragging = false,
  recentlyDroppedId,
  isColumnActive = false,
  hiddenTaskId,
}: DroppableColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    },
  });

  const isHighlighted = isColumnActive || isOver;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg transition-all duration-200 flex flex-col h-full min-h-[300px] lg:min-h-[500px]",
        isDragging && "bg-muted/30",
        isHighlighted && "bg-primary/10 ring-2 ring-primary ring-offset-2 ring-offset-background"
      )}
    >
      <div className={cn("border-t-4 rounded-t-lg", borderClassName)} />
      <div className="px-3 pt-3 pb-4 flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
          <h3 className={cn("font-semibold", titleClassName)}>{title}</h3>
          <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", countClassName)}>
            {tasks.length}
          </span>
        </div>
        <div className="space-y-3 flex-1">
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map((task) => (
              <DraggableTaskCard
                key={task.id}
                task={task}
                users={users}
                onEdit={() => onEditTask(task)}
                onDelete={onTaskDeleted}
                isRecentlyDropped={recentlyDroppedId === task.id}
                isHidden={hiddenTaskId === task.id}
              />
            ))}
          </SortableContext>
          {tasks.length === 0 && (
            <Card className={cn(
              "border-dashed transition-all duration-200 h-full min-h-[150px]",
              isHighlighted && "border-primary bg-primary/5"
            )}>
              <CardContent className="flex items-center justify-center h-full text-sm text-muted-foreground">
                {isHighlighted ? "Drop here" : `No ${title.toLowerCase()} tasks`}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
