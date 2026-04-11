# TaskFlow - Task Management Application

A modern, responsive task management application built with React and TypeScript. TaskFlow allows users to create projects, manage tasks with different priorities and statuses, and collaborate with team members.

---

## 1. Overview

TaskFlow is a **frontend-only** task management system built for the Frontend Engineer role. It demonstrates:

- Modern React patterns with TypeScript
- Component-based architecture using custom UI components inspired by shadcn/ui
- Mock API implementation using MSW (Mock Service Worker)
- JWT-based authentication flow
- Responsive design for mobile and desktop

### Tech Stack

| Category | Technology |
|----------|-----------|
| Framework | React 18 with TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS |
| UI Components | Custom components built with Radix UI primitives |
| Routing | React Router v6 |
| API Mocking | MSW (Mock Service Worker) |
| Icons | Lucide React |
| Containerization | Docker with nginx |

---

## 2. Architecture Decisions

### Why MSW for API Mocking?
I chose Mock Service Worker (MSW) over alternatives like json-server because:
- **Realistic API simulation**: MSW intercepts network requests at the service worker level, making the mock API behavior indistinguishable from a real backend
- **Same code path**: The frontend code uses the exact same fetch calls that would work with a real backend
- **Better testing experience**: MSW handlers can be reused in tests

### Component Architecture
- **UI Components**: Built a set of reusable, accessible components inspired by shadcn/ui, using Radix UI primitives for accessibility
- **Feature Components**: Separated business logic components (ProjectsPage, TaskCard) from presentational UI components
- **Context-based State**: Used React Context for global state (auth, theme) to avoid prop drilling

### Optimistic UI Updates
Task status changes are handled optimistically - the UI updates immediately and reverts if the API call fails. This provides a snappier user experience.

### Drag-and-Drop Implementation
Implemented using @dnd-kit, the drag-and-drop feature allows users to:
- Drag tasks between columns (To Do, In Progress, Done) to change their status
- Visual feedback with highlighted drop zones and a rotated drag overlay
- Keyboard accessibility support for drag operations

### Tradeoffs Made
1. **No real-time updates**: Chose polling/manual refresh over WebSocket implementation to keep scope manageable for a frontend-only assignment
2. **Local storage for auth**: Production would use httpOnly cookies for better security

---

## 3. Running Locally

```bash
git clone https://github.com/architasingh19/taskflow-archita-singh.git
cd taskflow-archita-singh
cp .env.example .env
docker compose up --build
# App available at http://localhost:3000
```

That's it! The application will be available at **http://localhost:3000**

### Alternative: Development Mode (requires Node.js 18+)

```bash
cd frontend
npm install
npm run dev
# App available at http://localhost:5173
```

---

## 4. Running Migrations

**Not applicable for this frontend-only submission.**

This project uses MSW (Mock Service Worker) to simulate the backend API entirely in the browser. There is no real database or backend server, so no migrations are required.

The mock data is pre-seeded in `frontend/src/mocks/data.ts` and includes:
- 2 users (test credentials below)
- 2 projects
- 5 tasks with different statuses (todo, in_progress, done)

---

## 5. Test Credentials

Use these credentials to log in immediately without registering:

```
Email:    test@example.com
Password: password123
```

Alternative user:
```
Email:    jane@example.com
Password: secret123
```

---

## 6. API Reference

The application uses MSW to mock the following API endpoints:

### Authentication

#### POST `/api/auth/register`
Register a new user.

**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "secret123"
}
```

**Response (201):**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

#### POST `/api/auth/login`
Authenticate a user.

**Request:**
```json
{
  "email": "test@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "token": "<jwt>",
  "user": {
    "id": "uuid",
    "name": "Test User",
    "email": "test@example.com"
  }
}
```

### Projects

All project endpoints require `Authorization: Bearer <token>` header.

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects` | List all accessible projects |
| POST | `/api/projects` | Create a new project |
| GET | `/api/projects/:id` | Get project with tasks |
| PATCH | `/api/projects/:id` | Update project (owner only) |
| DELETE | `/api/projects/:id` | Delete project (owner only) |

### Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/projects/:id/tasks` | List tasks with optional filters (`?status=`, `?assignee=`) |
| POST | `/api/projects/:id/tasks` | Create a task |
| PATCH | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task |

### Error Responses

```json
// 400 Validation Error
{
  "error": "validation failed",
  "fields": { "email": "is required" }
}

// 401 Unauthorized
{ "error": "unauthorized" }

// 403 Forbidden
{ "error": "forbidden" }

// 404 Not Found
{ "error": "not found" }
```

---

## 7. What I'd Do With More Time

### Immediate Improvements
1. **Unit/Integration Tests**: Add Vitest + Testing Library tests for components
2. **Better error handling**: Implement toast notifications for success/error feedback
3. **Pagination**: Add infinite scroll or pagination for projects/tasks list
4. **Task reordering within columns**: Add ability to reorder tasks by priority within the same column

### Architecture Enhancements
1. **React Query**: Replace manual state management with TanStack Query for caching and background refetching
2. **Form Library**: Use react-hook-form + zod for more robust form handling
3. **State Machine**: Consider XState for complex flows like auth

### Security Improvements
1. **CSRF Protection**: Add CSRF tokens if this were a real backend
2. **Rate Limiting**: Implement client-side rate limiting for auth endpoints
3. **Input Sanitization**: Add DOMPurify for user-generated content

### UX Improvements
1. **Keyboard Navigation**: Add keyboard shortcuts for power users
2. **Search**: Global search across projects and tasks
3. **Notifications**: In-app notifications for task assignments/due dates
4. **Offline Support**: Service worker for offline viewing

---

## Features Implemented

- [x] User registration and login with JWT
- [x] Protected routes with auth state persistence
- [x] Project CRUD operations
- [x] Task management with status, priority, assignee, due date
- [x] Task filtering by status and assignee
- [x] Kanban-style task board (grouped by status)
- [x] Optimistic UI updates for task status changes
- [x] Dark mode with system preference detection
- [x] Responsive design (375px - 1280px+)
- [x] Loading and error states throughout
- [x] Empty states with actionable CTAs
- [x] Form validation with error messages
- [x] Multi-stage Docker build

### Bonus Features
- [x] Dark mode toggle that persists across sessions
- [x] Responsive mobile-first design
- [x] Drag-and-drop to change task status between columns

---

## Project Structure

```
taskflow-archita-singh/
├── docker-compose.yml
├── .env.example
├── README.md
└── frontend/
    ├── Dockerfile
    ├── nginx.conf
    ├── package.json
    ├── src/
    │   ├── components/
    │   │   ├── layout/
    │   │   │   ├── Layout.tsx
    │   │   │   └── Navbar.tsx
    │   │   ├── projects/
    │   │   │   ├── CreateProjectDialog.tsx
    │   │   │   └── EditProjectDialog.tsx
    │   │   ├── tasks/
    │   │   │   ├── CreateTaskDialog.tsx
    │   │   │   ├── EditTaskDialog.tsx
    │   │   │   ├── TaskCard.tsx
    │   │   │   ├── TaskFilters.tsx
    │   │   │   └── TaskList.tsx
    │   │   └── ui/
    │   │       └── ... (reusable UI components)
    │   ├── contexts/
    │   │   ├── AuthContext.tsx
    │   │   └── ThemeContext.tsx
    │   ├── lib/
    │   │   ├── api.ts
    │   │   └── utils.ts
    │   ├── mocks/
    │   │   ├── browser.ts
    │   │   ├── data.ts
    │   │   └── handlers.ts
    │   ├── pages/
    │   │   ├── LoginPage.tsx
    │   │   ├── ProjectDetailPage.tsx
    │   │   ├── ProjectsPage.tsx
    │   │   └── RegisterPage.tsx
    │   ├── types/
    │   │   └── index.ts
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    └── public/
        └── mockServiceWorker.js
```

---

## License

MIT
