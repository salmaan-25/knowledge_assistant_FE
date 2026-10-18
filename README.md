# Knowledge Assistant Frontend

A professional React + TypeScript frontend for the Personal Knowledge Assistant API.

## Stack

- **React 18** + **TypeScript** (Vite)
- **Material UI (MUI)** for components & theming
- **Redux Toolkit** + **RTK Query** for state and API calls
- **React Router v6** for routing
- **react-markdown** + **remark-gfm** for markdown rendering in chat

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app runs at `http://localhost:5173`.

## Environment

Create a `.env` file in the project root:

```env
VITE_API_BASE_URL=http://localhost:8000
```

## Project Structure

```
src/
├── hooks/         # useAuth, useAppStore (typed Redux hooks)
├── layouts/       # AuthLayout, DashboardLayout
├── lib/           # theme.ts (MUI theme), storage.ts (localStorage)
├── pages/         # auth/, chat/, dashboard/, documents/, quiz/, progress/
├── routes/        # AppRoutes.tsx, ProtectedRoute.tsx
├── store/         # Redux store, slices (auth, ui), RTK Query API slice
└── types/         # api.ts (full TypeScript types from API contract)
```

## Features

| Page | Description |
|---|---|
| Login / Register | JWT auth with auto-login on registration |
| Dashboard | Stats overview + recent document cards |
| Documents | PDF upload with live polling, document cards |
| Document Detail | Status, performance analytics, weak topics |
| Chat | RAG chat with markdown rendering + source page pills |
| Quiz | Config wizard + interactive quiz session |
| Quiz Results | Score ring, per-question review, AI explanations |
| Progress | Overall stats + per-document topic accuracy bars |
