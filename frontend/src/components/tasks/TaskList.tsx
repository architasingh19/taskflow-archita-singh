import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
  type DropAnimation,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { ClipboardList } from 'lucide-react';
import { api } from '../../lib/api';
import { Card, CardContent } from '../ui/card';
import { DroppableColumn } from './DroppableColumn';
import { TaskCardContent } from './TaskCardContent';
import { EditTaskDialog } from './EditTaskDialog';
import type { Task, TaskStatus, User, ApiError } from '../../types';

interface TaskListProps {
  tasks: Task[];
  users: User[];
  onTaskUpdated: (task: Task) => void;
  onTaskDeleted: (taskId: string) => void;
}

const dropAnimationConfig: DropAnimation = {
  duration: 0,
  easing: 'linear',
  keyframes: () => [
    { opacity: 0 },
    { opacity: 0 },
  ],
};

export function TaskList({ tasks, users, onTaskUpdated, onTaskDeleted }: TaskListProps) {
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [recentlyDroppedId, setRecentlyDroppedId] = useState<string | null>(null);
  const [activeOverColumn, setActiveOverColumn] = useState<TaskStatus | null>(null);
  const [animatingTaskId, setAnimatingTaskId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) {
      setActiveTask(task);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (!over) {
      setActiveOverColumn(null);
      return;
    }

    // Determine which column we're over
    if (over.data.current?.type === 'column') {
      setActiveOverColumn(over.data.current.status as TaskStatus);
    } else if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task as Task;
      setActiveOverColumn(overTask.status);
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    const draggedTask = activeTask;
    
    setActiveOverColumn(null);

    if (!over || !draggedTask) {
      setActiveTask(null);
      return;
    }

    let newStatus: TaskStatus | null = null;

    // Check if dropped on a column
    if (over.data.current?.type === 'column') {
      newStatus = over.data.current.status as TaskStatus;
    }
    // Check if dropped on another task
    else if (over.data.current?.type === 'task') {
      const overTask = over.data.current.task as Task;
      newStatus = overTask.status;
    }

    // Update status if it changed
    if (newStatus && newStatus !== draggedTask.status) {
      // Set animatingTaskId BEFORE clearing activeTask to prevent flicker
      const taskId = active.id as string;
      setAnimatingTaskId(taskId);
      setActiveTask(null);
      
      try {
        const updatedTask = await api.updateTask(draggedTask.id, { status: newStatus });
        onTaskUpdated(updatedTask);
        
        // Show drop animation after task is updated
        setRecentlyDroppedId(taskId);
        // Clear animating state after a brief delay to ensure smooth transition
        requestAnimationFrame(() => {
          setAnimatingTaskId(null);
          setTimeout(() => setRecentlyDroppedId(null), 400);
        });
      } catch (err) {
        const apiError = err as ApiError;
        console.error('Failed to update task status:', apiError.error);
        setAnimatingTaskId(null);
      }
    } else {
      // Status didn't change, just clear activeTask
      setActiveTask(null);
    }
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="grid gap-4 lg:grid-cols-3 lg:gap-6 lg:auto-rows-fr">
          <DroppableColumn
            id="todo"
            title="To Do"
            tasks={todoTasks}
            users={users}
            titleClassName="text-muted-foreground"
            countClassName="bg-muted"
            borderClassName="border-slate-400 dark:border-slate-600"
            onEditTask={setEditingTask}
            onTaskDeleted={onTaskDeleted}
            isDragging={!!activeTask}
            recentlyDroppedId={recentlyDroppedId}
            isColumnActive={activeOverColumn === 'todo'}
            hiddenTaskId={activeTask?.id || animatingTaskId}
          />

          <DroppableColumn
            id="in_progress"
            title="In Progress"
            tasks={inProgressTasks}
            users={users}
            titleClassName="text-blue-600 dark:text-blue-400"
            countClassName="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400"
            borderClassName="border-blue-500 dark:border-blue-400"
            onEditTask={setEditingTask}
            onTaskDeleted={onTaskDeleted}
            isDragging={!!activeTask}
            recentlyDroppedId={recentlyDroppedId}
            isColumnActive={activeOverColumn === 'in_progress'}
            hiddenTaskId={activeTask?.id || animatingTaskId}
          />

          <DroppableColumn
            id="done"
            title="Done"
            tasks={doneTasks}
            users={users}
            titleClassName="text-green-600 dark:text-green-400"
            countClassName="bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400"
            borderClassName="border-green-500 dark:border-green-400"
            onEditTask={setEditingTask}
            onTaskDeleted={onTaskDeleted}
            isDragging={!!activeTask}
            recentlyDroppedId={recentlyDroppedId}
            isColumnActive={activeOverColumn === 'done'}
            hiddenTaskId={activeTask?.id || animatingTaskId}
          />
        </div>

        <DragOverlay dropAnimation={dropAnimationConfig}>
          {activeTask && (
            <div className="rotate-2 scale-105 shadow-2xl">
              <TaskCardContent
                task={activeTask}
                users={users}
                onEdit={() => {}}
                onDelete={() => {}}
                disableNavigation
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

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
