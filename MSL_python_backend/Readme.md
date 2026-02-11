# Low-Power Localization Backend

## Overview

This service implements a power-efficient mobile localization system that determines device proximity and estimated location **without using GPS**.

Instead of satellite positioning, the system uses:
- Cellular tower metadata
- Signal strength indicators
- Crowd-sourced fingerprint learning

The backend is built using:

- Python 3.11+
- FastAPI
- SQLAlchemy (ORM)
- Alembic (migrations)
- SQLite (development)
- PostgreSQL-ready (production)

This backend is responsible for:
- Receiving cellular scan data
- Generating signal fingerprints
- Matching devices to known room clusters
- Returning proximity confidence scores
- Storing historical learning data

---

## Architecture Overview

