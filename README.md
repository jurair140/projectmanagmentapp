# Jurair Project Management — MERN Stack Project & Task Management Platform

Jurair Project Management is a full-stack SaaS project and task management web application built with **MongoDB, Express.js, React.js, and Node.js**. It helps individuals and small teams organize projects, collaborate with members, manage Kanban task boards, monitor automatic project progress, and stay ahead of deadlines.

---

## Features

- **Secure Authentication**: Registration, login, logout, password policy validation, `bcryptjs` hashing, and JWT stored in HTTP-only cookies (`SameSite` & `Secure` production-ready), plus rate-limiting on auth endpoints.
- **Dynamic Dashboard**: Real-time statistics (Total Projects, Active Projects, Total Tasks, Completed Tasks, Pending Tasks, Overdue Tasks), Project Overview, My Tasks, Upcoming Deadlines, Quick Actions, and a Recharts Productivity Chart.
- **Project Management**: Full CRUD, search, status filtering, sorting, automatic progress calculation (`Completed / Total × 100`), completion suggestions when all tasks finish, and strict owner/member access control.
- **Team Collaboration**: Invite registered users by email, view member task counts, and remove members (automatically unassigning their project tasks while protecting owner integrity).
- **Task Management & Kanban Board**: 3-column Kanban board (`To Do`, `In Progress`, `Completed`) with status dropdown & drag-and-drop, list view toggle, task details modal, overdue & 3-day due-soon badges, and backend filtering/pagination.
- **Notifications**: Persistent MongoDB notifications for task assignments, project additions, task completions, and approaching deadlines, with unread badge, mark-as-read, mark-all-read, and delete actions.
- **User Profile & Settings**: Update full name, upload/remove profile image (validated `multer` uploads), and change password.

---

## Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router DOM, Axios, Context API, React Hook Form, Recharts, Lucide React, React Hot Toast
- **Backend**: Node.js, Express.js, Mongoose (MongoDB), JWT, `bcryptjs`, `express-validator`, `cookie-parser`, `express-rate-limit`, `helmet`, `cors`, `multer`

---

## Folder Structure

```text
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Route business logic (MVC)
│   ├── middleware/      # Auth, permissions, uploads, error handling
│   ├── models/          # Mongoose schemas (User, Project, Task, Notification)
│   ├── routes/          # Express REST API routes
│   ├── tests/           # End-to-end API integration tests
│   ├── utils/           # Token helpers, progress calculation, notification helper, seed script
│   ├── validators/      # express-validator request rules
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI, layout, dashboard, project, task, team, notifications
│   │   ├── context/     # AuthContext
│   │   ├── hooks/       # useAuth
│   │   ├── pages/       # Route views
│   │   ├── routes/      # ProtectedRoute & PublicRoute
│   │   ├── services/    # Axios API service modules
│   │   └── utils/       # Date & formatting helpers
│   └── vercel.json
└── README.md
```

---

## Local Setup

### 1. Prerequisites
- Node.js 18+ (tested with Node 22)
- MongoDB (local MongoDB Server or MongoDB Atlas connection string)

### 2. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your MONGODB_URI and JWT_SECRET
npm install
npm run dev
```

Optional development seed data (creates demo accounts `alice@taskflow.dev`, `bob@taskflow.dev`, `carol@taskflow.dev` with password `Password123`):
```bash
npm run seed
```

### 3. Frontend Setup
```bash
cd frontend
cp .env.example .env
# Ensure VITE_API_URL points to your backend (default: http://localhost:5000/api)
npm install
npm run dev
```

### 4. Running Backend Integration Tests
```bash
cd backend
npm test
```

---

## Environment Variables

### Backend (`backend/.env`)
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/taskflow?retryWrites=true&w=majority
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

### Frontend (`frontend/.env`)
```env
VITE_API_URL=http://localhost:5000/api
```

---

## Deployment on Vercel (Both Backend & Frontend)

Deploy this repository as **two separate Vercel projects** from the same GitHub repository:

### 1. Backend Project (Vercel)
1. Push your repository to GitHub.
2. In Vercel, click **Add New → Project** and select your repository.
3. Set **Root Directory** to `backend`.
4. Leave Framework Preset as **Other** (`backend/vercel.json` routes all requests to `backend/api/index.js`).
5. Add Environment Variables:
   - `MONGODB_URI` = your MongoDB Atlas connection string (include database name, e.g. `/taskflow?retryWrites=true&w=majority`, and ensure MongoDB Atlas Network Access allows `0.0.0.0/0` for Vercel serverless IPs)
   - `JWT_SECRET` = a strong random secret
   - `NODE_ENV` = `production`
   - `CLIENT_URL` = your frontend Vercel URL (add/update this once the frontend is deployed, e.g. `https://jurair-project-management.vercel.app`)
6. Click **Deploy** and copy the backend URL (e.g. `https://jurair-pm-api.vercel.app`).

### 2. Frontend Project (Vercel)
1. In Vercel, click **Add New → Project** and import the **same** repository again.
2. Set **Root Directory** to `frontend`.
3. Framework Preset: **Vite** (`frontend/vercel.json` handles React Router rewrites).
4. Add Environment Variable:
   - `VITE_API_URL` = `https://<your-backend-vercel-domain>/api`
5. Click **Deploy**, copy the frontend URL, and make sure `CLIENT_URL` in the backend Vercel project matches it exactly (no trailing slash).
