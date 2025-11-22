"""FastAPI application for StockMaster (modular routers)."""
import logging

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from .database import init_db
from .api.routers import (
    auth as auth_router,
    operations as operations_router,
    dashboard as dashboard_router,
    products as products_router,
    locations as locations_router,
    moves as moves_router,
    quants as quants_router,
    ledger as ledger_router,
    warehouses as warehouses_router,
    partners as partners_router,
    reorder_rules as reorder_rules_router,
    users as users_router,
)


app = FastAPI(title="StockMaster")

# Configure CORS for local frontend development. In production, set a
# specific origin via the `CORS_ORIGINS` env var (comma-separated).
origins_env = os.getenv("CORS_ORIGINS")
if origins_env:
    origins = [o.strip() for o in origins_env.split(",") if o.strip()]
else:
    origins = [
        "http://localhost:5173",  # Vite default
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


@app.on_event("startup")
def on_startup():
    logging.getLogger(__name__).info("Initializing DB (creating tables if needed)")
    init_db()


# Include routers
app.include_router(auth_router.router)
app.include_router(operations_router.router)
app.include_router(dashboard_router.router)
app.include_router(products_router.router)
app.include_router(locations_router.router)
app.include_router(moves_router.router)
app.include_router(quants_router.router)
app.include_router(ledger_router.router)
app.include_router(warehouses_router.router)
app.include_router(partners_router.router)
app.include_router(reorder_rules_router.router)
app.include_router(users_router.router)