"""FastAPI application for StockMaster (modular routers)."""
import logging

from fastapi import FastAPI

from .database import init_db
from .api.routers import auth as auth_router, operations as operations_router, dashboard as dashboard_router


app = FastAPI(title="StockMaster")


@app.on_event("startup")
def on_startup():
    logging.getLogger(__name__).info("Initializing DB (creating tables if needed)")
    init_db()


# Include routers
app.include_router(auth_router.router)
app.include_router(operations_router.router)
app.include_router(dashboard_router.router)
