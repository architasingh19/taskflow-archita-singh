import { useState } from 'react';
import { ClipboardList } from 'lucide-react';
import { Card, CardContent } from '../ui/card';
import { TaskCard } from './TaskCard';
import { EditTaskDialog } from './EditTaskDialog';
import type { Task, User } from '../../types';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

export function TaskList({ tasks, users, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <ClipboardList className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No tasks found</h3>
          <p className="text-muted-foreground text-center">
            Create your first task to get started or adjust your filters.
          </p>
        </CardContent>
      </Card>
    );
  }

  const todoTasks = tasks.filter((t) => t.status === 'todo');
  const inProgressTasks = tasks.filter((t) => t.status === 'in_progress');
  const doneTasks = tasks.filter((t) => t.status === 'done');

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-muted-foreground">To Do</h3>
            <span className="rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium">
              {todoTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {todoTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onEdit={() => setEditingTask(task)}
                onStatusChange={onTaskUpdated}
                onDelete={onTaskDeleted}
              />
            ))}
            {todoTasks.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No tasks to do
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-blue-600 dark:text-blue-400">In Progress</h3>
            <span className="rounded-full bg-blue-100 dark:bg-blue-900 px-2.5 py-0.5 text-xs font-medium text-blue-600 dark:text-blue-400">
              {inProgressTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {inProgressTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onEdit={() => setEditingTask(task)}
                onStatusChange={onTaskUpdated}
                onDelete={onTaskDeleted}
              />
            ))}
            {inProgressTasks.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No tasks in progress
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-green-600 dark:text-green-400">Done</h3>
            <span className="rounded-full bg-green-100 dark:bg-green-900 px-2.5 py-0.5 text-xs font-medium text-green-600 dark:text-green-400">
              {doneTasks.length}
            </span>
          </div>
          <div className="space-y-3">
            {doneTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                users={users}
                onEdit={() => setEditingTask(task)}
                onStatusChange={onTaskUpdated}
                onDelete={onTaskDeleted}
              />
            ))}
            {doneTasks.length === 0 && (
              <Card className="border-dashed">
                <CardContent className="flex items-center justify-center py-8 text-sm text-muted-foreground">
                  No completed tasks
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {editingTask && (
        <EditTaskDialog
          open={!!editingTask}
          onOpenChange={(open) => !open && setEditingTask(null)}
          task={editingTask}
          users={users}
          onTaskUpdated={(task) => {
            onTaskUpdated(task);
            setEditingTask(null);
          }}
        />
      )}
    </>
  );
}
