# MSL (Mobile Sensor Location) - Full Stack Application

A complete full-stack application for mobile sensor location tracking with a React frontend and FastAPI backend.

## Project Structure

```
MSL/
├── MSL_frontend/          # React TypeScript frontend
├── MSL_python_backend/    # FastAPI backend
├── docker-compose.yml     # Docker compose for local development
└── README.md
```

## Prerequisites

- Docker & Docker Compose (recommended)
- OR Node.js 20+ and Python 3.10+

## Quick Start with Docker Compose

### Local Development

1. Clone the repository and navigate to the root directory:
```bash
cd /path/to/MSL
```

2. Start all services:
```bash
docker-compose up -d
```

3. Access the applications:
   - **Frontend**: http://localhost:5173 (dev mode) or http://localhost:3000 (production)
   - **Backend API**: http://localhost:8000
   - **API Docs**: http://localhost:8000/docs

### Environment Configuration

#### Backend
Copy `.env.example` to `.env` in `MSL_python_backend/`:
```bash
cp MSL_python_backend/.env.example MSL_python_backend/.env
```

Configure these variables:
- `DATABASE_URL`: PostgreSQL connection string
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS

#### Frontend
Copy `.env.example` to `.env.local` in `MSL_frontend/`:
```bash
cp MSL_frontend/.env.example MSL_frontend/.env.local
```

Configure:
- `VITE_API_BASE_URL`: Backend API URL

## Local Development (without Docker)

### Backend Setup

```bash
cd MSL_python_backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Edit .env with your database configuration

# Start PostgreSQL manually (or use docker run)
docker run -d -e POSTGRES_PASSWORD=password -p 5432:5432 postgres:15-alpine

# Run migrations and start server
uvicorn app:app --reload --port 8000
```

### Frontend Setup

```bash
cd MSL_frontend

# Install dependencies
npm install

# Create .env.local
cp .env.example .env.local
# Edit .env.local with backend URL

# Start development server
npm run dev
```

## Deployment

### Quick Deploy to Railway (Recommended)

The easiest way to deploy this full-stack application is to Railway.app, which handles Docker deployment and automatically provisions PostgreSQL.

#### For Backend (MSL_python_backend)

1. Go to https://railway.app and sign in with GitHub
2. Create a new project and select "GitHub Repo"
3. Select the `MSL_python_backend` repository
4. Railway detects the Dockerfile automatically
5. Add a PostgreSQL plugin:
   - Click "Add Service" → "PostgreSQL"
   - Railway sets `DATABASE_URL` automatically
6. Set environment variables in the "Variables" tab:
   ```
   ENVIRONMENT=production
   DEBUG=False
   ```
7. Deploy - Railway builds and deploys automatically
8. Get your backend URL from the "Deployments" tab (e.g., `https://your-project-xxxxx.up.railway.app`)

#### For Frontend (MSL_frontend)

1. Deploy frontend to Vercel (it's already configured):
   - Go to https://vercel.com
   - Import `MSL_fullstack` GitHub repository
2. Set environment variables in Vercel project settings:
   ```
   VITE_API_BASE_URL=https://your-backend-url.up.railway.app
   ```
3. Redeploy frontend after setting the backend URL

#### Verify the Deployment

```bash
# Test backend health
curl https://your-backend-url.up.railway.app/health

# Test stats endpoint
curl https://your-backend-url.up.railway.app/stats

# View API documentation
https://your-backend-url.up.railway.app/docs
```

Your app is now live! Frontend on Vercel + Backend on Railway.

### Docker Images

The project includes Dockerfiles for both frontend and backend. You can build and deploy them to any Docker-compatible service.

**Build Backend Image:**
```bash
cd MSL_python_backend
docker build -t msl-backend:latest .
```

**Build Frontend Image:**
```bash
cd MSL_frontend
docker build -t msl-frontend:latest .
```

### Alternative Deployment Services

If you prefer not to use Railway, here are other options:

- **Render.com** - Similar to Railway, free tier available
- **AWS ECS** - Scalable container orchestration
- **Google Cloud Run** - Serverless container deployment
- **Heroku** - (requires credit card, not free anymore)
- **DigitalOcean App Platform** - Docker-native, affordable

For detailed instructions on deploying the backend, see [MSL_python_backend/DEPLOYMENT.md](MSL_python_backend/DEPLOYMENT.md)

## API Endpoints

### Health Check
- `GET /health` - Server health status

### Dashboard
- `GET /stats` - Get dashboard statistics (total devices, present devices, etc.)

### Live Scans
- `GET /live?limit=50` - Get recent scan results

### Submit Scan
- `POST /scan` - Submit a new scan for processing

See `http://localhost:8000/docs` for full API documentation (SwaggerUI)

## Development

### Code Structure

**Frontend:**
- `src/components/` - Reusable React components
- `src/pages/` - Page-level components
- `src/api/` - API client
- `src/types/` - TypeScript interfaces
- `src/styles/` - CSS modules and theme

**Backend:**
- `api.py` - API routes and handlers
- `app.py` - FastAPI application setup
- `db.py` - Database models and configuration
- `fingerprint.py` - Signal fingerprinting logic
- `matching.py` - Location matching algorithms
- `learning.py` - Machine learning functions
- `models.py` - Additional data models

## Troubleshooting

### Docker Issues
```bash
# View logs
docker-compose logs -f

# Rebuild images
docker-compose build --no-cache

# Reset everything
docker-compose down -v
```

### Database Connection Issues
- Ensure PostgreSQL is running and accessible
- Check `DATABASE_URL` format
- Verify port 5432 is available

### CORS Errors
- Add frontend URL to backend's `ALLOWED_ORIGINS`
- Restart backend after changing environment variables

## Support

For issues or questions, please check the individual README files in:
- `MSL_frontend/README.md`
- `MSL_python_backend/` (create if needed)

## License

MIT
