const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const gestureRoutes = require('./routes/gesture');

dotenv.config();
connectDB();

const app = express();

// ── CORS ─────────────────────────────────────────────────────────────────────
// In production the React build is served from this same Express process, so
// cross-origin requests only come from external clients (e.g. mobile dev tools).
// CLIENT_ORIGIN env var restricts which origin is allowed; omit it to allow all
// (useful for local development).
const allowedOrigin = process.env.CLIENT_ORIGIN;

app.use(
  cors({
    origin: allowedOrigin
      ? (origin, callback) => {
          // Allow requests with no origin (mobile apps, curl, Postman)
          if (!origin || origin === allowedOrigin) {
            callback(null, true);
          } else {
            callback(new Error(`CORS policy: origin ${origin} not allowed`));
          }
        }
      : true, // allow all origins when CLIENT_ORIGIN is not set (dev mode)
    credentials: true,
  })
);

// ── Body parsing ──────────────────────────────────────────────────────────────
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ── API routes ────────────────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/gestures', gestureRoutes);

// ── Health-check (useful for Render zero-downtime deploys) ────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ── Serve React build in production ──────────────────────────────────────────
// The React build output sits one level up at ../build (relative to /backend).
if (process.env.NODE_ENV === 'production') {
  const buildPath = path.join(__dirname, '..', 'build');
  app.use(express.static(buildPath));
  // All non-API routes return the React app (client-side routing support)
  app.get('*', (_req, res) => {
    res.sendFile(path.join(buildPath, 'index.html'));
  });
}

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`AccessAble backend running on port ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});
