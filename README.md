# OdooXSpit — StockMaster

This repository contains a lightweight warehouse/stock management backend (FastAPI + SQLAlchemy) and a React + Vite frontend (StockMaster). It is intended as a developer-focused project for managing receipts, deliveries, internal transfers and inventory.

## Repository layout

- `backend/` — FastAPI service, Alembic migrations, and SQLAlchemy models.
- `frontend/OdooXSPIT-StockMaster/` — React UI built with Vite and Tailwind.
- `myenv/` — local Python virtual environment (ignored by .gitignore).

## Quick start (Development)

Prerequisites:

- Python 3.11+
- Node.js 18+ / npm

Backend

1. Create and activate a virtual environment (or use the provided `myenv`):

```powershell
python -m venv .venv
.\\.venv\\Scripts\\Activate.ps1
```

2. Install dependencies:

```powershell
cd backend
pip install -r requirements.txt
```

3. Set environment variables (example):

```powershell
$env:DATABASE_URL = "postgresql+psycopg2://<user>:<password>@<host>:<port>/<dbname>"
```

4. Run migrations (if using Alembic) and start the server:

```powershell
# alembic upgrade head
uvicorn src.stockmaster.main:app --reload --port 8000
```

Frontend

1. Install dependencies and start Vite:

```powershell
cd frontend\\OdooXSPIT-StockMaster
npm install
npm run dev
```

2. Open the local Vite URL printed in the terminal (usually `http://localhost:5173`).

## Notes

- API endpoints require authentication for most operations. Use the frontend login or call the backend auth endpoints directly.
- `backend/src/stockmaster/api/routers/dashboard.py` provides a lightweight `/dashboard/kpis` endpoint consumed by the frontend.

## Contributing

- Make code changes on feature branches and open a pull request to `MAIN`.

## License

This project does not include a license file; add one if you intend to open-source it.
