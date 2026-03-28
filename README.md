# hackathon-project

## Backend (Express API)

The Node.js + Express API lives in the `backend/` directory. It serves JSON under `/api` and stores temporary data in `backend/data/` (ignored by git).

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm (comes with Node)

### Install dependencies

From the repository root:

```bash
cd backend
npm install
```

### Start the server

Development (restarts the process when files change):

```bash
cd backend
npm run dev
```

Production-style (no file watcher):

```bash
cd backend
npm start
```

The API listens on **http://localhost:4001** by default. Check health with [http://localhost:4001/api/health](http://localhost:4001/api/health).

Optional environment variables:

- `PORT` — override the listen port (default `4001`).
- `DATA_FILE` — absolute path to the JSON file used for temp storage (default `backend/data/data.json`).

### Libraries map (Google Places)

The library page calls **Places API (New)** on the backend. Copy `backend/.env.example` to `backend/.env` and set:

- **`GOOGLE_PLACES_API_KEY`** — create a key in [Google Cloud Console](https://console.cloud.google.com/), enable **Places API (New)**, and (recommended) restrict the key to that API.

Optional:

- **`DEFAULT_MAP_LAT`** / **`DEFAULT_MAP_LNG`** — defaults for “nearby” when the user does not share location (preset: World Trade Center area).

Restart the backend after changing `.env`.

## Frontend (CampusCompass)

The Next.js app lives in the `frontend/` directory.

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ (LTS recommended)
- npm (comes with Node)

### Install dependencies

From the repository root:

```bash
cd frontend
npm install
```

### Start the development server

```bash
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The dev server reloads when you change files.

For the **Libraries** page, the frontend calls the Express API (by default `http://localhost:4001`). Copy `frontend/.env.example` to `frontend/.env.local` if you need a different base URL:

- **`NEXT_PUBLIC_API_BASE_URL`** — e.g. `http://localhost:4001` (no trailing slash).

Run the backend and frontend together in development.

### Production build (optional)

```bash
cd frontend
npm run build
npm start
```

`npm start` serves the optimized build (defaults to port 3000 unless `PORT` is set).
