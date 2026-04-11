import type { User, Project, Task } from '../types';

export const mockUsers: User[] = [
  {
    id: 'user-1',
    name: 'Test User',
    email: 'test@example.com',
    created_at: '2026-01-01T00:00:00Z',
  },
  {
    id: 'user-2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    created_at: '2026-01-15T00:00:00Z',
  },
];

export const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'Website Redesign',
    description: 'Q2 project to redesign the company website',
    owner_id: 'user-1',
    created_at: '2026-04-01T10:00:00Z',
  },
  {
    id: 'project-2',
    name: 'Mobile App Development',
    description: 'Build a mobile app for iOS and Android',
    owner_id: 'user-1',
    created_at: '2026-03-15T08:30:00Z',
  },
];

export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Design homepage mockup',
    description: 'Create wireframes and high-fidelity mockups for the new homepage',
    status: 'in_progress',
    priority: 'high',
    project_id: 'project-1',
    assignee_id: 'user-1',
    due_date: '2026-04-15',
    created_at: '2026-04-02T09:00:00Z',
    updated_at: '2026-04-05T14:30:00Z',
  },
  {
    id: 'task-2',
    title: 'Set up development environment',
    description: 'Configure build tools, linting, and testing frameworks',
    status: 'done',
    priority: 'medium',
    project_id: 'project-1',
    assignee_id: 'user-2',
    due_date: '2026-04-08',
    created_at: '2026-04-01T10:00:00Z',
    updated_at: '2026-04-07T16:00:00Z',
  },
  {
    id: 'task-3',
    title: 'Write API documentation',
    description: 'Document all REST endpoints with examples',
    status: 'todo',
    priority: 'low',
    project_id: 'project-1',
    assignee_id: undefined,
    due_date: '2026-04-20',
    created_at: '2026-04-03T11:00:00Z',
    updated_at: '2026-04-03T11:00:00Z',
  },
  {
    id: 'task-4',
    title: 'Setup React Native project',
    description: 'Initialize the React Native project with TypeScript',
    status: 'todo',
    priority: 'high',
    project_id: 'project-2',
    assignee_id: 'user-1',
    due_date: '2026-04-18',
    created_at: '2026-03-16T09:00:00Z',
    updated_at: '2026-03-16T09:00:00Z',
  },
  {
    id: 'task-5',
    title: 'Design app navigation flow',
    description: 'Create user flow diagrams and navigation structure',
    status: 'in_progress',
    priority: 'medium',
    project_id: 'project-2',
    assignee_id: 'user-2',
    due_date: '2026-04-12',
    created_at: '2026-03-17T10:30:00Z',
    updated_at: '2026-04-08T09:15:00Z',
  },
];

export const passwords: Record<string, string> = {
  'test@example.com': 'password123',
  'jane@example.com': 'secret123',
};
