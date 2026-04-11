import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MoreVertical, Trash2, Edit2, User as UserIcon } from 'lucide-react';
import { api } from '../../lib/api';
import { formatDate, cn } from '../../lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials } from '../../lib/utils';
import type { Task, TaskStatus, User, ApiError } from '../../types';

interface TaskCardContentProps {
  task: Task;
  users: User[];
  onEdit: () => void;
  onDelete: (taskId: string) => void;
  disableNavigation?: boolean;
}

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'info' | 'success' }> = {
  todo: { label: 'To Do', variant: 'default' },
  in_progress: { label: 'In Progress', variant: 'info' },
  done: { label: 'Done', variant: 'success' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  high: { label: 'High', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export function TaskCardContent({ task, users, onEdit, onDelete, disableNavigation = false }: TaskCardContentProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const navigate = useNavigate();

  const assignee = users.find((u) => u.id === task.assignee_id);
  const statusInfo = statusConfig[task.status];
  const priorityInfo = priorityConfig[task.priority];

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await api.deleteTask(task.id);
      onDelete(task.id);
    } catch (err) {
      const apiError = err as ApiError;
      console.error('Failed to delete task:', apiError.error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    if (disableNavigation) return;
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('[role="menuitem"]')) {
      return;
    }
    navigate(`/projects/${task.project_id}/tasks/${task.id}`);
  };

  return (
    <Card 
      className={cn(
        "transition-all hover:shadow-md",
        isDeleting && "opacity-50 pointer-events-none",
        !disableNavigation && "cursor-pointer hover:border-primary/50"
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2 min-w-0">
          <CardTitle className="text-base font-medium line-clamp-2 break-words min-w-0">
            {task.title}
          </CardTitle>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onEdit}>
                <Edit2 className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-2 break-words">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <Badge className={priorityInfo.className}>{priorityInfo.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          {assignee && (
            <div className="flex items-center gap-1.5">
              <Avatar className="h-6 w-6">
                <AvatarFallback className="text-xs">
                  {getInitials(assignee.name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground truncate max-w-[80px]">
                {assignee.name}
              </span>
            </div>
          )}
          {!assignee && (
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <UserIcon className="h-4 w-4" />
              <span className="text-xs">Unassigned</span>
            </div>
          )}

          {task.due_date && (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              <span>{formatDate(task.due_date)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
