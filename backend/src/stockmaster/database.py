"""Database setup for StockMaster.

This module exposes helpers for application runtime and for Alembic migration scripts.

Key exports that Alembic expects (if you adapt `alembic/env.py`):
- `get_database_url()` -> reads `DATABASE_URL` env var
- `get_engine(url=None)` -> returns a SQLAlchemy Engine
- `metadata` -> the SQLAlchemy MetaData (Base.metadata)

Default DATABASE_URL is Postgres; for quick local dev you can set it to a sqlite URL.
"""
import os
from typing import Optional
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

# Load environment variables from .env when present (local dev convenience)
load_dotenv()


def get_database_url() -> str:
    """Return the database URL from environment.

    Do NOT hardcode credentials in source. For local development, if `DATABASE_URL`
    is not set, fall back to a local sqlite database under `backend/dev.db` and
    log a warning so the developer can set a proper `DATABASE_URL` for CI/production.
    """
    url = os.getenv("DATABASE_URL")
    if url:
        return url
    # fallback for quick local development (non-sensitive)
    import logging

    logging.getLogger(__name__).warning(
        "DATABASE_URL not set; falling back to local sqlite at backend/dev.db. "
        "Set DATABASE_URL in your environment or .env for Postgres or production use."
    )
    return "sqlite:///./backend/dev.db"


def get_engine(database_url: Optional[str] = None):
    """Create and return a SQLAlchemy engine.

    Use this from Alembic's env.py if you need to create a connection for autogenerate.
    """
    url = database_url or get_database_url()
    return create_engine(url, pool_pre_ping=True)


# Module-level engine/session for app runtime
engine = get_engine()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Expose metadata for Alembic: `from stockmaster.database import metadata`
metadata = Base.metadata


def init_db(engine_local: Optional[object] = None):
    """Create all tables. Call at app startup or manually.

    Prefer using Alembic for schema migrations in most cases. This helper is useful
    for quick demos or tests.
    """
    Base.metadata.create_all(bind=engine_local or engine)
