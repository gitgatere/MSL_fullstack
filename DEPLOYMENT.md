# MSL Fullstack Deployment

## Components

- `MSL_python_backend`: FastAPI localization backend
- `MSL_frontend`: React/TypeScript dashboard

## Prerequisites

- Python 3.8+
- Node.js `>=20.19` or `>=22.12`
- PostgreSQL for production (SQLite is default local fallback)

## Local Run (No Docker)

### 1. Backend

```bash
cd MSL_python_backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
python3 migrations/apply_migrations.py
uvicorn app:app --host 0.0.0.0 --port 8000
```

Set env for protected endpoints:

```bash
export MSL_API_KEY=dev-local-key
export ALLOWED_ORIGINS=http://localhost:5173
```

### 2. Frontend

```bash
cd MSL_frontend
npm install
export VITE_API_BASE_URL=http://localhost:8000
export VITE_API_KEY=dev-local-key
npm run dev
```

## Verification Commands

### Backend

```bash
cd MSL_python_backend
DATABASE_URL=sqlite:///./verify.db python3 -m unittest discover -s tests -p 'test_*.py' -v
```

### Frontend

```bash
cd MSL_frontend
npm run lint
npx tsc --noEmit
npm run build
```

## Production Notes

- Use PostgreSQL and set `DATABASE_URL`
- Restrict `ALLOWED_ORIGINS`
- Set strong `MSL_API_KEY`
- Terminate TLS (HTTPS) at ingress/reverse proxy
- Run `python3 retraining.py` on a schedule for adaptive updates

## API

- `GET /health`
- `POST /scan` (auth)
- `GET /live` (auth)
- `GET /stats` (auth)
- Docs: `/docs`

## Android Logger Scope

This repository currently does **not** include Android source code.
Backend request contract and permissions are documented in `MSL_python_backend/README.md`.
