# Team Task Manager

A full-stack Team Task Management Web Application built with Next.js, Prisma, and PostgreSQL. It allows users to create projects, invite team members, assign tasks, and track progress using role-based access control.

## 🚀 Features

- **User Authentication:** Secure signup and login using JWT stored in HTTP-only cookies.
- **Role-Based Access Control:** 
  - **Admins** can create projects, invite members, and manage all tasks.
  - **Members** can view assigned projects and update task statuses.
- **Project Management:** Create projects and build your team.
- **Task Tracking:** Create, assign, and update tasks (To Do, In Progress, Done).
- **Interactive Dashboard:** View task statistics, overdue tasks, and a quick summary of your workload.
- **Premium UI:** Designed with a sleek, modern, and responsive dark mode using Vanilla CSS.

## 🛠️ Tech Stack

- **Frontend:** Next.js (App Router), React, Vanilla CSS
- **Backend:** Next.js API Routes (RESTful APIs)
- **Database:** PostgreSQL (via Prisma ORM)
- **Authentication:** JWT, bcryptjs
- **Deployment:** Railway

## 💻 Local Setup Instructions

1. **Clone the repository:**
   ```bash
   git clone <your-github-repo-url>
   cd task-manager
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up the database:**
   By default, the local environment uses SQLite for easy setup.
   ```bash
   npx prisma db push
   ```

4. **Environment Variables:**
   Ensure you have a `.env` file in the root directory with the following (the default setup includes this):
   ```env
   DATABASE_URL="file:./dev.db"
   JWT_SECRET="your-super-secret-jwt-key"
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](team-task-manager-production-046e.up.railway.app) in your browser.

## 🌍 Deployment on Railway

This application is configured for seamless deployment on Railway.

1. Push your code to a GitHub repository.
2. Log into [Railway.app](https://railway.app) and click **New Project** > **Deploy from GitHub repo**.
3. Select your repository.
4. Click **New** again and add a **PostgreSQL** database service to the project.
5. In your Next.js service settings, go to the **Variables** tab and add:
   - `DATABASE_URL`: Set this to the connection string of your Railway Postgres database (e.g., `${{Postgres.DATABASE_URL}}`).
   - `JWT_SECRET`: Set this to a random secure string.
6. Railway will automatically build and deploy your application. You can generate a public URL in the Next.js service settings under the "Settings" > "Domains" tab.

## 📝 Assignment Requirements Fulfilled
- [x] REST APIs + Database
- [x] Authentication & Role-Based Access
- [x] Dashboard & Task Tracking
- [x] Railway Deployment 
