import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User as UserIcon, Clock, Edit2, Trash2 } from 'lucide-react';
import { api } from '../lib/api';
import { formatDate, getInitials, cn } from '../lib/utils';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import { Spinner } from '../components/ui/spinner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { EditTaskDialog } from '../components/tasks/EditTaskDialog';
import type { Task, TaskStatus, Project, User, ApiError } from '../types';

const statusConfig: Record<TaskStatus, { label: string; variant: 'default' | 'info' | 'success'; color: string }> = {
  todo: { label: 'To Do', variant: 'default', color: 'bg-slate-500' },
  in_progress: { label: 'In Progress', variant: 'info', color: 'bg-blue-500' },
  done: { label: 'Done', variant: 'success', color: 'bg-green-500' },
};

const priorityConfig = {
  low: { label: 'Low', className: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  medium: { label: 'Medium', className: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' },
  high: { label: 'High', className: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' },
};

export function TaskDetailPage() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>();
  const navigate = useNavigate();
  
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchData = useCallback(async () => {
    if (!projectId || !taskId) return;
    
    try {
      setIsLoading(true);
      setError('');
      
      const [projectData, usersData] = await Promise.all([
        api.getProject(projectId),
        fetch('/api/users', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        }).then(res => res.json())
      ]);
      
      setProject(projectData);
      setUsers(usersData.users || []);
      
      const foundTask = projectData.tasks?.find((t: Task) => t.id === taskId);
      if (foundTask) {
        setTask(foundTask);
      } else {
        setError('Task not found');
      }
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to load task');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, taskId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTaskUpdated = (updatedTask: Task) => {
    setTask(updatedTask);
    setIsEditOpen(false);
  };

  const handleDelete = async () => {
    if (!task) return;
    
    setIsDeleting(true);
    try {
      await api.deleteTask(task.id);
      navigate(`/projects/${projectId}`);
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError.error || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !task) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <p className="text-destructive mb-4">{error || 'Task not found'}</p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate(`/projects/${projectId}`)}>
            Go back
          </Button>
          <Button onClick={fetchData}>Try again</Button>
        </div>
      </div>
    );
  }

  const assignee = users.find((u) => u.id === task.assignee_id);
  const statusInfo = statusConfig[task.status];
  const priorityInfo = priorityConfig[task.priority];

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to={`/projects/${projectId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground">
            {project?.name}
          </p>
          <h1 className="text-2xl font-bold tracking-tight break-words">{task.title}</h1>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={() => setIsEditOpen(true)}>
            <Edit2 className="h-4 w-4 mr-2" />
            Edit
          </Button>
          <Button variant="destructive" size="sm" onClick={() => setIsDeleteDialogOpen(true)}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Description</CardTitle>
          </CardHeader>
          <CardContent>
            {task.description ? (
              <p className="text-muted-foreground whitespace-pre-wrap break-words">
                {task.description}
              </p>
            ) : (
              <p className="text-muted-foreground italic">No description provided</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">Status</p>
              <div className="flex items-center gap-2">
                <div className={cn("w-3 h-3 rounded-full", statusInfo.color)} />
                <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Priority</p>
              <Badge className={priorityInfo.className}>{priorityInfo.label}</Badge>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">Assignee</p>
              {assignee ? (
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>{getInitials(assignee.name)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{assignee.name}</p>
                    <p className="text-xs text-muted-foreground">{assignee.email}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <UserIcon className="h-4 w-4" />
                  <span className="text-sm">Unassigned</span>
                </div>
              )}
            </div>

            {task.due_date && (
              <div>
                <p className="text-sm font-medium mb-2">Due Date</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span className="text-sm">{formatDate(task.due_date)}</span>
                </div>
              </div>
            )}

            <div>
              <p className="text-sm font-medium mb-2">Created</p>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{formatDate(task.created_at)}</span>
              </div>
            </div>

            {task.updated_at && task.updated_at !== task.created_at && (
              <div>
                <p className="text-sm font-medium mb-2">Last Updated</p>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">{formatDate(task.updated_at)}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isEditOpen && (
        <EditTaskDialog
          open={isEditOpen}
          onOpenChange={setIsEditOpen}
          task={task}
          users={users}
          onTaskUpdated={handleTaskUpdated}
        />
      )}

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Task</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{task.title}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting ? <Spinner size="sm" className="mr-2" /> : null}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
