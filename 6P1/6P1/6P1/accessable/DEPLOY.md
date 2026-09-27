# AccessAble — Deployment Guide

This guide deploys AccessAble as a **single web service** on [Render.com](https://render.com) (free tier) backed by a **MongoDB Atlas** database (free tier). The result is a public HTTPS URL that works on any laptop or mobile browser — no app store required.

---

## Architecture Overview

```
Browser / Mobile
      │  HTTPS
      ▼
 Render Web Service
 ┌──────────────────────────────────┐
 │  Express (Node.js)               │
 │  ├── /api/auth    ← JWT auth     │
 │  ├── /api/gestures               │
 │  ├── /api/health  ← health check │
 │  └── /*           ← React SPA   │
 └──────────────────────────────────┘
      │  mongoose
      ▼
 MongoDB Atlas (free M0 cluster)
```

The React app is **compiled at build time** and served as static files by Express — no separate frontend server is needed.

---

## Prerequisites

- A [GitHub](https://github.com) account (Render deploys from Git)
- A [Render.com](https://render.com) account (free)
- A [MongoDB Atlas](https://www.mongodb.com/atlas) account (free)

---

## Step 1 — Set Up MongoDB Atlas

1. Sign in to [MongoDB Atlas](https://cloud.mongodb.com).
2. Create a free **M0** cluster (choose the region closest to your users — e.g. Mumbai for India).
3. **Database Access** → Add a new database user:
   - Username: `accessable-user` (or any name)
   - Password: generate a strong password — **copy it now**
   - Role: **Atlas admin** (or `readWriteAnyDatabase`)
4. **Network Access** → Add IP address → choose **Allow access from anywhere** (`0.0.0.0/0`).  
   *(Render's IPs are dynamic, so this is required for the free plan.)*
5. **Connect** → **Drivers** → copy the connection string. It looks like:
   ```
   mongodb+srv://accessable-user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```
6. Replace `<password>` with your actual password and append the database name:
   ```
   mongodb+srv://accessable-user:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/accessable?retryWrites=true&w=majority
   ```
   Save this — it's your `MONGO_URI`.

---

## Step 2 — Push the Project to GitHub

If you haven't already:

```powershell
# From inside the accessable/ folder
cd "c:\Users\HP\Documents\AccessAble\6P1\6P1\6P1\accessable"

git init
git add .
git commit -m "Initial commit – AccessAble"

# Create a new repo on GitHub (https://github.com/new), then:
git remote add origin https://github.com/YOUR_USERNAME/accessable.git
git push -u origin main
```

> Make sure the `.env` and `backend/.env` files are **not** committed — `.gitignore` already excludes them.

---

## Step 3 — Deploy on Render

### Option A — Automatic (using render.yaml)

The `render.yaml` file in the project root configures everything automatically.

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**.
2. Connect your GitHub repo.
3. Render detects `render.yaml` and pre-fills the service config.
4. You will be prompted to fill in **secret** environment variables — enter your `MONGO_URI` from Step 1.
5. Click **Apply** — Render will build and deploy automatically.

### Option B — Manual

1. Render Dashboard → **New** → **Web Service**.
2. Connect your GitHub repo → select the `accessable` repository.
3. Fill in:

   | Field | Value |
   |---|---|
   | **Name** | `accessable` |
   | **Region** | Singapore (or closest to you) |
   | **Branch** | `main` |
   | **Root Directory** | *(leave blank)* |
   | **Runtime** | `Node` |
   | **Build Command** | `npm install && npm run build && cd backend && npm install` |
   | **Start Command** | `cd backend && node server.js` |

4. Under **Environment Variables**, add:

   | Key | Value |
   |---|---|
   | `NODE_ENV` | `production` |
   | `MONGO_URI` | your Atlas connection string |
   | `JWT_SECRET` | a long random string (generate below) |
   | `CLIENT_ORIGIN` | `https://accessable.onrender.com` *(your Render URL)* |

   Generate a JWT secret:
   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

5. Click **Create Web Service**.

---

## Step 4 — Verify the Deployment

Once the build completes (typically 3–5 minutes):

1. Open `https://accessable.onrender.com/api/health` — should return:
   ```json
   { "status": "ok", "timestamp": "..." }
   ```
2. Open `https://accessable.onrender.com` — the AccessAble login screen should appear.
3. Register a new account and test both **Assistant Mode** and **Translator Mode**.

---

## Step 5 — Test on Mobile

1. Open the Render URL on your phone's browser (Chrome on Android, Safari on iOS).
2. When the app asks for **camera** or **microphone** permission, tap **Allow**.
3. For the best experience, tap **Add to Home Screen** in your browser menu — the app will open like a native app.

> **Note:** The Web Speech API (voice recognition) requires Chrome on Android or Safari on iOS. Firefox mobile does not support `SpeechRecognition`.

---

## Running Locally (Development)

```powershell
# Terminal 1 – backend
cd "c:\Users\HP\Documents\AccessAble\6P1\6P1\6P1\accessable\backend"
# Create .env from the template
Copy-Item .env.example .env
# Edit .env and fill in your values, then:
npm run dev

# Terminal 2 – frontend
cd "c:\Users\HP\Documents\AccessAble\6P1\6P1\6P1\accessable"
npm start
```

The React dev server runs on `http://localhost:3000` and proxies API calls to `http://localhost:5000` (configured via `"proxy"` in `package.json`).

---

## Keeping Costs at Zero (Free Tier Notes)

| Service | Free Tier Limits |
|---|---|
| **Render** (free web service) | Spins down after 15 min of inactivity; first request after idle takes ~30 s |
| **MongoDB Atlas** (M0) | 512 MB storage, shared CPU — plenty for this app |

To avoid the Render spin-down delay, upgrade to the **Starter** plan ($7/month) or use a free uptime-monitoring service (e.g. UptimeRobot) to ping `/api/health` every 10 minutes.

---

## Environment Variables Reference

| Variable | Where | Required in Prod | Description |
|---|---|---|---|
| `MONGO_URI` | backend `.env` | **Yes** | MongoDB Atlas connection string |
| `JWT_SECRET` | backend `.env` | **Yes** | Secret for signing JWT tokens (min 32 chars) |
| `PORT` | backend `.env` | No (Render sets it) | Express listen port |
| `NODE_ENV` | backend `.env` | **Yes** (`production`) | Enables static file serving |
| `CLIENT_ORIGIN` | backend `.env` | Recommended | Allowed CORS origin (your Render URL) |

---

## Updating the Deployment

Every `git push` to `main` triggers an automatic redeploy on Render:

```powershell
git add .
git commit -m "your change"
git push
```

Render will rebuild and do a zero-downtime swap.
