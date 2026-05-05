================================================================================
  TEAM TASK MANAGER - Full Stack Application
  Stack: Spring Boot 3 + React + MySQL
================================================================================

LIVE URL: [Add after deployment]
GITHUB: [Add your repo link]
DEMO VIDEO: [Add your video link]

--------------------------------------------------------------------------------
FEATURES
--------------------------------------------------------------------------------
✅ Authentication — JWT-based Signup & Login (Admin / Member roles)
✅ Project Management — Create, view, update, delete projects
✅ Team Management — Add/remove members per project
✅ Task Management — Create tasks with title, description, priority, due date
✅ Task Assignment — Assign tasks to team members
✅ Task Status Tracking — TODO → IN_PROGRESS → REVIEW → DONE
✅ Kanban Board — Drag-style status board per project
✅ Dashboard — Stats: total projects, tasks by status, overdue count
✅ My Tasks — Personal task list with filter by status
✅ Role-Based Access Control — Admin sees all; Members see assigned projects
✅ Overdue Detection — Tasks past due date flagged automatically

--------------------------------------------------------------------------------
TECH STACK
--------------------------------------------------------------------------------
Backend:
  - Spring Boot 3.2
  - Spring Security (JWT Authentication)
  - Spring Data JPA + Hibernate
  - MySQL 8+
  - Maven

Frontend:
  - React 18 (Vite)
  - React Router v6
  - Axios (HTTP client)
  - Tailwind CSS
  - Lucide React (icons)

--------------------------------------------------------------------------------
PROJECT STRUCTURE
--------------------------------------------------------------------------------
team-task-manager/
├── backend/                         # Spring Boot API
│   ├── src/main/java/com/taskmanager/
│   │   ├── entity/                  # JPA Entities (User, Project, Task)
│   │   ├── repository/              # JPA Repositories
│   │   ├── service/                 # Business Logic
│   │   ├── controller/              # REST Controllers
│   │   ├── dto/                     # Data Transfer Objects
│   │   ├── security/                # JWT + Spring Security config
│   │   └── config/                  # Exception Handler
│   ├── src/main/resources/
│   │   └── application.properties   # DB + JWT config
│   └── pom.xml                      # Maven dependencies
│
└── frontend/                        # React App
    ├── src/
    │   ├── pages/                   # Page components
    │   ├── components/layout/       # Layout + Sidebar
    │   ├── context/                 # Auth context
    │   ├── services/                # Axios API calls
    │   └── App.jsx + main.jsx
    ├── vite.config.js
    └── package.json

--------------------------------------------------------------------------------
DATABASE SCHEMA
--------------------------------------------------------------------------------
Tables:
  users            — id, name, email, password, role (ADMIN/MEMBER), created_at
  projects         — id, name, description, status, owner_id, created_at, updated_at
  project_members  — project_id, user_id (many-to-many)
  tasks            — id, title, description, status, priority, due_date,
                     project_id, assigned_to, created_by, created_at, updated_at

--------------------------------------------------------------------------------
API ENDPOINTS
--------------------------------------------------------------------------------
Auth:
  POST /api/auth/signup         Register new user
  POST /api/auth/login          Login, returns JWT

Users:
  GET  /api/users/me            Get current user
  GET  /api/users               Get all users (Admin only)

Projects:
  GET    /api/projects          Get all accessible projects
  POST   /api/projects          Create project
  GET    /api/projects/{id}     Get project details
  PUT    /api/projects/{id}     Update project
  DELETE /api/projects/{id}     Delete project
  POST   /api/projects/{id}/members        Add member by email
  DELETE /api/projects/{id}/members/{uid}  Remove member

Tasks:
  GET    /api/projects/{id}/tasks   List tasks for project
  POST   /api/projects/{id}/tasks   Create task
  GET    /api/tasks/my              My assigned tasks
  PUT    /api/tasks/{id}            Update task
  PATCH  /api/tasks/{id}/status     Update status only
  DELETE /api/tasks/{id}            Delete task

Dashboard:
  GET /api/dashboard            Stats + recent tasks/projects

--------------------------------------------------------------------------------
LOCAL SETUP
--------------------------------------------------------------------------------

PREREQUISITES:
  - Java 17+
  - Maven 3.8+
  - Node.js 18+
  - MySQL 8+

STEP 1 — MySQL Setup:
  CREATE DATABASE taskmanager;
  CREATE USER 'taskuser'@'localhost' IDENTIFIED BY 'password';
  GRANT ALL ON taskmanager.* TO 'taskuser'@'localhost';

STEP 2 — Backend:
  cd backend
  # Edit src/main/resources/application.properties if needed
  mvn clean install -DskipTests
  mvn spring-boot:run

  Backend runs at: http://localhost:8080

STEP 3 — Frontend:
  cd frontend
  npm install
  npm run dev

  Frontend runs at: http://localhost:5173

--------------------------------------------------------------------------------
DEPLOYMENT ON RAILWAY
--------------------------------------------------------------------------------

Railway lets you deploy both services + MySQL from one dashboard.

STEP 1 — Push to GitHub:
  git init
  git add .
  git commit -m "Initial commit"
  git remote add origin https://github.com/YOUR_USERNAME/team-task-manager.git
  git push -u origin main

STEP 2 — Railway Setup:
  1. Go to https://railway.app and sign in
  2. Click "New Project" → "Deploy from GitHub repo"
  3. Select your repository

STEP 3 — Add MySQL:
  1. In Railway project → "+ New" → "Database" → MySQL
  2. Railway auto-creates MYSQL_URL, MYSQL_USER, MYSQL_PASSWORD etc.

STEP 4 — Backend Service Config:
  1. Add new service → select your repo → set Root Directory = "backend"
  2. Set environment variables:
     MYSQL_HOST     = <from MySQL service>
     MYSQL_PORT     = 3306
     MYSQL_DB       = railway
     MYSQL_USER     = <from MySQL service>
     MYSQL_PASSWORD = <from MySQL service>
     JWT_SECRET     = YourSuperSecretKeyHere!@#2024
  3. Railway will auto-detect Maven and build the Spring Boot jar

STEP 5 — Frontend Service Config:
  1. Add new service → select your repo → set Root Directory = "frontend"
  2. Set environment variables:
     VITE_API_URL = https://<your-backend-railway-url>/api
  3. Railway detects Vite and runs "npm run build"

STEP 6 — Done!
  Your app is live. Copy the frontend URL as the Live URL.

--------------------------------------------------------------------------------
ROLE-BASED ACCESS CONTROL
--------------------------------------------------------------------------------
ADMIN:
  - See all projects and tasks
  - Create/delete any project
  - Add/remove members from any project
  - Delete any task

MEMBER:
  - See only projects they belong to
  - Create projects (becomes owner)
  - Manage own projects (add members, create tasks)
  - Update status of assigned tasks

--------------------------------------------------------------------------------
DEMO ACCOUNTS (create via /signup)
--------------------------------------------------------------------------------
  Admin:  admin@demo.com  / password123  (role: ADMIN)
  Member: member@demo.com / password123  (role: MEMBER)

================================================================================
