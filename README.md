# Food Agent App

This repo now contains:

- Frontend: Expo app in the project root
- Backend: Express API in `backend/`

## Project structure

```text
.
├── app/                  # Expo Router screens
├── components/           # UI components
├── backend/
│   ├── package.json
│   └── src/index.js      # Express server entrypoint
└── package.json          # Frontend scripts
```

## Install dependencies

1. Frontend dependencies

```bash
npm install
```

2. Backend dependencies

```bash
npm --prefix backend install
```

## Run frontend + backend (two terminals)

1. Terminal 1 (frontend)

```bash
npm run dev:frontend
```

2. Terminal 2 (backend)

```bash
npm run dev:backend
```

Backend default URL: `http://localhost:3000`

Quick check endpoints:

- `GET /health`
- `GET /api/ping`

## Frontend-only mode

If you only want UI work, run:

```bash
npm run start
```
