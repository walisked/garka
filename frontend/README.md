# DigiAGIS Frontend

This frontend is built with React + Vite + MUI and is intended to connect to the DigiAGIS backend.

Quick start:

1. Copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.
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
- [ ] Test verification request and claim flows
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
