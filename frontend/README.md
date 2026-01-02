# DigiAGIS Frontend

This frontend is built with React + Vite + MUI and is intended to connect to the DigiAGIS backend.

Quick start:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

> **API base URL note:** If you don't set `VITE_API_BASE_URL`, the frontend will default to the relative path `/api` (so requests go to `/api/...`). If you run the frontend on Codespaces or a different host and your backend is at a different origin, set `VITE_API_BASE_URL` to include the `/api` prefix, e.g. `VITE_API_BASE_URL=http://localhost:5000/api`.
2. Install dependencies: `npm install`
3. Start dev server: `npm run dev`
4. Run tests: `npm test` (uses Vitest)

Deployment:

- Build: `npm run build`
- Host on Vercel/Netlify and set environment variables in provider dashboard. See `.env.example` for required keys.

QA checklist:

- [ ] Test registration, login, and token persistence
- [ ] Test role-based redirects
- [ ] Test property listing form and file uploads against backend
- [x] Test verification request and claim flows (basic frontend simulation implemented)

## Request Verification & Payment Simulation

- After clicking a property card in the marketplace, users can view property details including the **Deal Initiator** (name, phone, email, rank).
- Clicking **Request Verification** opens the payment modal. In local development (no Monnify configured), payment is simulated and treated as successful.
- On simulated success, the property becomes **Reserved** and a **12-hour countdown** starts (visible on the property card and property details).
- The payment modal accepts an `onSuccess` callback which is used to mark properties reserved in the marketplace.

## Run & Test

Start dev server:

```bash
cd frontend
npm install
npm run dev
```

Run tests (vitest):

```bash
cd frontend
npm test
```

Note: some end-to-end payment flows use Monnify and require the backend env variables described in the project README to run end-to-end. Local tests use a sandbox/simulated path.
- [ ] Run `npm test` and ensure unit tests pass

# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
