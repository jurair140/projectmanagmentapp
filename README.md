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

## Deployment

### Backend (Render)
1. Create a new Web Service pointing to `backend/`.
2. Build command: `npm install`
3. Start command: `npm start`
4. Set environment variables (`MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL` set to your Vercel URL, `NODE_ENV=production`).

### Frontend (Vercel)
1. Import repository with Root Directory set to `frontend`.
2. Framework preset: `Vite`.
3. Set `VITE_API_URL` to `https://<your-render-service>.onrender.com/api`.
4. `frontend/vercel.json` is preconfigured for client-side React Router rewrites.
