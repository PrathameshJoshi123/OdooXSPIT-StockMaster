"""FastAPI application for StockMaster (modular routers)."""
import logging

from fastapi import FastAPI

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