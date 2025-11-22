"""Dashboard router providing simple KPIs."""
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ...deps import get_db, get_current_user
from ... import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis")
def kpis(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    total_products = db.query(models.Product).count()
    ops = (
        db.query(models.StockOperation.status, func.count(models.StockOperation.id))
        .group_by(models.StockOperation.status)
        .all()
    )
    ops_summary = {s.value: c for s, c in ops}
    return {"total_products": total_products, "operations": ops_summary}
