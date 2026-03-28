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

The API listens on **http://localhost:4000** by default. Check health with [http://localhost:4000/api/health](http://localhost:4000/api/health).

Optional environment variables:

- `PORT` — override the listen port (default `4000`).
- `DATA_FILE` — absolute path to the JSON file used for temp storage (default `backend/data/data.json`).

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

### Production build (optional)

```bash
cd frontend
npm run build
npm start
```

`npm start` serves the optimized build (defaults to port 3000 unless `PORT` is set).
