TaskFlow Pro
A premium MERN Stack Task Management Web Application built with React, Node.js, Express.js, and MongoDB.

Designed as a premium editorial productivity workspace, pairing warm ivory surfaces,
high-contrast typography, expressive coral and fuchsia accents, and custom abstract artwork.

Features:
* User Authentication using JWT
* Register & Login System
* Create, Edit, Delete Tasks (with optional due dates)
* Mark Tasks as Completed or Pending
* Search & Filter Tasks
* Quick filters (Today / Overdue / Completed) and daily progress
* **My Day** focus mode — a calm view of today's and overdue tasks with progress
* **Little Wins** — a subtle, reduced-motion-aware completion celebration
* Editorial Taskflow Pro UI
* Dark / Light Theme
* Responsive Design
* Protected Routes
* Toast Notifications
* User Settings Page
* Deployment-specific frontend and backend configuration

Tech Stack :-
Frontend:
* React.js
* SCSS
* Framer Motion
* React Icons
* Axios
* React Toastify

Backend:
* Node.js
* Express.js
* MongoDB
* JWT Authentication
* Bcrypt.js

Deployment :

Frontend :
Deployed on Vercel

Backend :
Deployed on Render

Installation
Clone Repository :

```bash
git clone https://github.com/Kavinaya-12/taskflow-pro.git
```

### Install Frontend

```bash
cd client
npm install
npm run dev
```

### Install Backend

```bash
cd server
npm install
npm start
```

## Environment Variables

Create `server/.env` for local development:

```env
MONGO_URI=<your MongoDB connection string>
JWT_SECRET=<a random secret with at least 32 characters>
NODE_ENV=development
PORT=5000
CORS_ORIGIN=http://localhost:5173
# Set only when deployed behind a known number of trusted reverse proxies.
TRUST_PROXY_HOPS=0
MONGO_SERVER_SELECTION_TIMEOUT_MS=10000
```

The API requires `MONGO_URI` and a `JWT_SECRET` of at least 32 characters. Set `CORS_ORIGIN` to the exact frontend origin (comma-separated for multiple origins) for split deployments. Hosting platforms provide `PORT`. Set `TRUST_PROXY_HOPS` only to the number of trusted reverse proxies in front of the API; leave it at `0` for direct access. Account deletion uses a MongoDB transaction, so the configured MongoDB deployment must support transactions (Atlas or a replica set).

For every production frontend build, set `VITE_API_URL` to the API base, including `/api`. Use `/api` only when the host routes that path to the backend; for a separate Vercel frontend and Render backend, use the actual Render API origin with `/api`. The build fails with a diagnostic when this value is absent. Do not set a localhost URL in the production frontend. The backend must run with `NODE_ENV=production` and allow the frontend origin through `CORS_ORIGIN`. `client/vercel.json` supplies the Vite SPA deep-link rewrite for direct routes such as `/dashboard`.

For local development, run both processes in separate terminals, and start the API first:

```bash
cd server
npm run dev
```

After the API reports that it is running, start the frontend in a second terminal:

```bash
cd client
npm run dev
```

The API requires a reachable MongoDB instance and the `MONGO_URI` and `JWT_SECRET` values in `server/.env`; it will not listen if startup configuration or the database connection fails. Check `http://127.0.0.1:5000/health` for API/database readiness. Vite proxies `/api` to `http://127.0.0.1:5000` (IPv4 avoids Windows `localhost` resolving to IPv6 while the API binds to IPv4). Login and registration are rate-limited per API process; use a hosting edge limit as well when running multiple backend instances.

For the documented hosting setup, configure the Render backend with root directory `server`, build command `npm install`, start command `npm start`, and health check path `/health`. Configure the Vercel frontend with root directory `client`, build command `npm run build`, output directory `dist`, and `VITE_API_URL` set to the actual backend API base. These are repository-based deployment instructions; no hosting dashboard or live service was checked.

The repository previously listed `https://taskflow-pro-jade.vercel.app/dashboard` as a live link; this audit did not verify an active hosted deployment.
