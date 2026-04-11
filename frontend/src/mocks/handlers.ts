import { http, HttpResponse, delay } from 'msw';
import { mockUsers, mockProjects, mockTasks, passwords } from './data';
import type { User, Project, Task, TaskStatus } from '../types';

const users = [...mockUsers];
const projects = [...mockProjects];
let tasks = [...mockTasks];

const generateToken = (userId: string) => {
  return btoa(JSON.stringify({ user_id: userId, exp: Date.now() + 86400000 }));
};

const verifyToken = (authHeader: string | null): User | null => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  try {
    const token = authHeader.replace('Bearer ', '');
    const decoded = JSON.parse(atob(token));
    if (decoded.exp < Date.now()) {
      return null;
    }
    return users.find((u) => u.id === decoded.user_id) || null;
  } catch {
    return null;
  }
};

const generateId = () => crypto.randomUUID();

export const handlers = [
  http.post('/api/auth/register', async ({ request }) => {
    await delay(300);
    const body = await request.json() as { name?: string; email?: string; password?: string };
    
    const errors: Record<string, string> = {};
    if (!body.name) errors.name = 'is required';
    if (!body.email) errors.email = 'is required';
    if (!body.password) errors.password = 'is required';
    
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { error: 'validation failed', fields: errors },
        { status: 400 }
      );
    }
    
    if (users.find((u) => u.email === body.email)) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { email: 'already exists' } },
        { status: 400 }
      );
    }
    
    const newUser: User = {
      id: generateId(),
      name: body.name!,
      email: body.email!,
      created_at: new Date().toISOString(),
    };
    
    users.push(newUser);
    passwords[body.email!] = body.password!;
    
    return HttpResponse.json(
      { token: generateToken(newUser.id), user: newUser },
      { status: 201 }
    );
  }),

  http.post('/api/auth/login', async ({ request }) => {
    await delay(300);
    const body = await request.json() as { email?: string; password?: string };
    
    const errors: Record<string, string> = {};
    if (!body.email) errors.email = 'is required';
    if (!body.password) errors.password = 'is required';
    
    if (Object.keys(errors).length > 0) {
      return HttpResponse.json(
        { error: 'validation failed', fields: errors },
        { status: 400 }
      );
    }
    
    const user = users.find((u) => u.email === body.email);
    if (!user || passwords[body.email!] !== body.password) {
      return HttpResponse.json(
        { error: 'invalid credentials' },
        { status: 401 }
      );
    }
    
    return HttpResponse.json({
      token: generateToken(user.id),
      user: { id: user.id, name: user.name, email: user.email },
    });
  }),

  http.get('/api/projects', async ({ request }) => {
    await delay(200);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const userProjects = projects.filter(
      (p) =>
        p.owner_id === user.id ||
        tasks.some((t) => t.project_id === p.id && t.assignee_id === user.id)
    );
    
    return HttpResponse.json({ projects: userProjects });
  }),

  http.post('/api/projects', async ({ request }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const body = await request.json() as { name?: string; description?: string };
    
    if (!body.name) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { name: 'is required' } },
        { status: 400 }
      );
    }
    
    const newProject: Project = {
      id: generateId(),
      name: body.name,
      description: body.description,
      owner_id: user.id,
      created_at: new Date().toISOString(),
    };
    
    projects.push(newProject);
    
    return HttpResponse.json(newProject, { status: 201 });
  }),

  http.get('/api/projects/:id', async ({ request, params }) => {
    await delay(200);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const project = projects.find((p) => p.id === params.id);
    
    if (!project) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    const projectTasks = tasks.filter((t) => t.project_id === project.id);
    
    return HttpResponse.json({ ...project, tasks: projectTasks });
  }),

  http.patch('/api/projects/:id', async ({ request, params }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const projectIndex = projects.findIndex((p) => p.id === params.id);
    
    if (projectIndex === -1) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    if (projects[projectIndex].owner_id !== user.id) {
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    
    const body = await request.json() as { name?: string; description?: string };
    projects[projectIndex] = { ...projects[projectIndex], ...body };
    
    return HttpResponse.json(projects[projectIndex]);
  }),

  http.delete('/api/projects/:id', async ({ request, params }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const projectIndex = projects.findIndex((p) => p.id === params.id);
    
    if (projectIndex === -1) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    if (projects[projectIndex].owner_id !== user.id) {
      return HttpResponse.json({ error: 'forbidden' }, { status: 403 });
    }
    
    tasks = tasks.filter((t) => t.project_id !== params.id);
    projects.splice(projectIndex, 1);
    
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/projects/:id/tasks', async ({ request, params }) => {
    await delay(200);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const url = new URL(request.url);
    const status = url.searchParams.get('status') as TaskStatus | null;
    const assignee = url.searchParams.get('assignee');
    
    let projectTasks = tasks.filter((t) => t.project_id === params.id);
    
    if (status) {
      projectTasks = projectTasks.filter((t) => t.status === status);
    }
    
    if (assignee) {
      projectTasks = projectTasks.filter((t) => t.assignee_id === assignee);
    }
    
    return HttpResponse.json({ tasks: projectTasks });
  }),

  http.post('/api/projects/:id/tasks', async ({ request, params }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const project = projects.find((p) => p.id === params.id);
    
    if (!project) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    const body = await request.json() as {
      title?: string;
      description?: string;
      priority?: string;
      assignee_id?: string;
      due_date?: string;
    };
    
    if (!body.title) {
      return HttpResponse.json(
        { error: 'validation failed', fields: { title: 'is required' } },
        { status: 400 }
      );
    }
    
    const newTask: Task = {
      id: generateId(),
      title: body.title,
      description: body.description,
      status: 'todo',
      priority: (body.priority as Task['priority']) || 'medium',
      project_id: params.id as string,
      assignee_id: body.assignee_id,
      due_date: body.due_date,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    tasks.push(newTask);
    
    return HttpResponse.json(newTask, { status: 201 });
  }),

  http.patch('/api/tasks/:id', async ({ request, params }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const taskIndex = tasks.findIndex((t) => t.id === params.id);
    
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    const body = await request.json() as Partial<Task>;
    tasks[taskIndex] = {
      ...tasks[taskIndex],
      ...body,
      updated_at: new Date().toISOString(),
    };
    
    return HttpResponse.json(tasks[taskIndex]);
  }),

  http.delete('/api/tasks/:id', async ({ request, params }) => {
    await delay(300);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    const taskIndex = tasks.findIndex((t) => t.id === params.id);
    
    if (taskIndex === -1) {
      return HttpResponse.json({ error: 'not found' }, { status: 404 });
    }
    
    tasks.splice(taskIndex, 1);
    
    return new HttpResponse(null, { status: 204 });
  }),

  http.get('/api/users', async ({ request }) => {
    await delay(200);
    const user = verifyToken(request.headers.get('Authorization'));
    
    if (!user) {
      return HttpResponse.json({ error: 'unauthorized' }, { status: 401 });
    }
    
    return HttpResponse.json({
      users: users.map((u) => ({ id: u.id, name: u.name, email: u.email })),
    });
  }),
];
