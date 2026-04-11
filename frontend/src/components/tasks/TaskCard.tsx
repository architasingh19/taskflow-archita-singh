import { useState } from 'react';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { getInitials } from '../../lib/utils';
import type { Task, TaskStatus, User, ApiError } from '../../types';

interface TaskCardProps {
  task: Task;
  users: User[];
  onEdit: () => void;
  onStatusChange: (task: Task) => void;
  onDelete: (taskId: string) => void;
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

export function TaskCard({ task, users, onEdit, onStatusChange, onDelete }: TaskCardProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [optimisticStatus, setOptimisticStatus] = useState<TaskStatus | null>(null);

  const assignee = users.find((u) => u.id === task.assignee_id);
  const currentStatus = optimisticStatus || task.status;
  const statusInfo = statusConfig[currentStatus];
  const priorityInfo = priorityConfig[task.priority];

  const handleStatusChange = async (newStatus: TaskStatus) => {
    if (newStatus === task.status) return;

    setOptimisticStatus(newStatus);
    setIsUpdating(true);

    try {
      const updatedTask = await api.updateTask(task.id, { status: newStatus });
      onStatusChange(updatedTask);
      setOptimisticStatus(null);
    } catch (err) {
      setOptimisticStatus(null);
      const apiError = err as ApiError;
      console.error('Failed to update task:', apiError.error);
    } finally {
      setIsUpdating(false);
    }
  };

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

  return (
    <Card className={cn(
      "transition-all",
      isUpdating && "opacity-70",
      isDeleting && "opacity-50 pointer-events-none"
    )}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <CardTitle className="text-base font-medium line-clamp-2">
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
          <p className="text-sm text-muted-foreground line-clamp-2">
            {task.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          <Badge className={priorityInfo.className}>{priorityInfo.label}</Badge>
        </div>

        <div className="flex items-center justify-between">
          <Select
            value={currentStatus}
            onValueChange={(value) => handleStatusChange(value as TaskStatus)}
            disabled={isUpdating}
          >
            <SelectTrigger className="h-8 w-[130px] text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="done">Done</SelectItem>
            </SelectContent>
          </Select>

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
        </div>

        {task.due_date && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5" />
            <span>Due {formatDate(task.due_date)}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
