# PantryPal

AI-powered recipe finder that analyzes photos of your pantry ingredients and finds allergy-safe recipes using SnowLeopard.

## Project structure

```text
.
├── app/                  # Expo Router screens (React Native)
│   ├── index.tsx         # Home — search, image picker, allergy/meal/goal chips
│   ├── results.tsx       # Recipe results from SnowLeopard
│   ├── recipe/[id].tsx   # Recipe detail
│   ├── api.ts            # API client (talks to the Python backend)
│   └── recipeStore.ts    # In-memory recipe cache for navigation
├── backend/
│   ├── server.py         # FastAPI server (GPT-4o vision + SnowLeopard)
│   └── requirements.txt  # Python dependencies
├── ingredient_analyzer.py  # Standalone CLI tool
├── package.json          # Expo / frontend config
└── .env                  # API keys (not committed)
```

## Prerequisites

- **Node.js** 18+
- **Python** 3.10+
- An [Expo Go](https://expo.dev/go) app on your phone
- API keys in `.env`:

```env
OPENAI_API_KEY=sk-...
SNOWLEOPARD_API_KEY=...
SNOWLEOPARD_DATAFILE_ID=...
```

## Install dependencies

### Frontend

```bash
npm install
```

### Backend

```bash
cd backend
pip install -r requirements.txt
```

## Run the app

You need **two terminals** — one for the backend, one for the Expo frontend.

### Terminal 1 — Backend

```bash
cd backend
uvicorn server:app --reload --host 0.0.0.0 --port 3000
```

### Terminal 2 — Frontend (Expo Go)

```bash
npx expo start
```

Scan the QR code with Expo Go on your phone. The app auto-detects your machine's IP for backend connectivity.

## How it works

1. **Snap a photo** of your pantry or fridge from the home screen.
2. **Set preferences** — allergies to avoid, meal type, dietary goal.
3. **Tap "Find Safe Recipes"** — the app sends your photo to GPT-4o to identify ingredients, then queries the SnowLeopard recipe database with those ingredients and your dietary requirements.
4. **Browse results** — tap any recipe to see full details and source links.

## API endpoints (backend)

| Method | Path                 | Description                          |
|--------|----------------------|--------------------------------------|
| GET    | `/health`            | Health check                         |
| POST   | `/api/analyze-image` | Upload image → GPT-4o → ingredients  |
| POST   | `/api/recipes`       | Ingredients + prefs → SnowLeopard    |
