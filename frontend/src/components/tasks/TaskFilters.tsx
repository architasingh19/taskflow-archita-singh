import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import type { TaskStatus, User } from '../../types';

interface TaskFiltersProps {
  statusFilter: TaskStatus | 'all';
  assigneeFilter: string;
  users: User[];
  onStatusChange: (status: TaskStatus | 'all') => void;
  onAssigneeChange: (assigneeId: string) => void;
}

export function TaskFilters({
  statusFilter,
  assigneeFilter,
  users,
  onStatusChange,
  onAssigneeChange,
}: TaskFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      <Select value={statusFilter} onValueChange={(value) => onStatusChange(value as TaskStatus | 'all')}>
        <SelectTrigger className="w-[140px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="todo">To Do</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="done">Done</SelectItem>
        </SelectContent>
      </Select>

      <Select value={assigneeFilter} onValueChange={onAssigneeChange}>
        <SelectTrigger className="w-[160px]">
          <SelectValue placeholder="Assignee" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Assignees</SelectItem>
          {users.map((user) => (
            <SelectItem key={user.id} value={user.id}>
              {user.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
