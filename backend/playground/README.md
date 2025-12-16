# Playground

Quick script to exercise common endpoints for local development.

Prerequisites:
- Server running (`npm run dev`)
- Local MongoDB running and `backend/.env` configured

Run:

```bash
cd backend
node playground/playground.js
```

Set a different API base URL:

```bash
PLAYGROUND_API_URL=http://localhost:5000/api node playground/playground.js
```
