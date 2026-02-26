# MSL Frontend

React + TypeScript + Vite dashboard for live localization monitoring.

## Requirements

- Node.js `>=20.19` or `>=22.12` (Vite 7 requirement)
- npm

## Setup

```bash
cd MSL_frontend
npm install
npm run dev
```

## Build and Quality Checks

```bash
npm run lint
npx tsc --noEmit
npm run build
```

## Environment Variables

- `VITE_API_BASE_URL` (default: `http://localhost:8000`)
- `VITE_API_KEY` (optional; sent as `X-API-Key`)

## Behavior

- Dashboard and live feed poll backend every 5 seconds
- API failures are handled gracefully with fallback UI
- Supports backend auth when `VITE_API_KEY` is set

## Notes

- Local dev server binding may be restricted by sandboxed environments; this does not affect production deployment.
