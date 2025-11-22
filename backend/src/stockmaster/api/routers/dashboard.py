"""Dashboard router providing simple KPIs."""
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session
from datetime import datetime

from ...deps import get_db, get_current_user
from ... import models

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/kpis")
def kpis(
    warehouse_id: Optional[int] = None,
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    # Basic counts
    total_products = db.query(models.Product).count()

    # Use StockQuant as the authoritative on-hand snapshot (quantity - reserved_qty)
    q = (
        db.query(models.StockQuant.product_id.label("product_id"), func.coalesce(func.sum(models.StockQuant.quantity - models.StockQuant.reserved_qty), 0).label("onhand"))
        .group_by(models.StockQuant.product_id)
    )
    if warehouse_id is not None:
        q = q.filter(models.StockQuant.location.has(models.Location.warehouse_id == warehouse_id))

    q_sub = q.subquery()

    # Left-join products to the quant aggregation so products without quants show onhand = 0
    stock_q = (
        db.query(models.Product.id.label("id"), func.coalesce(q_sub.c.onhand, 0).label("onhand"))
        .outerjoin(q_sub, q_sub.c.product_id == models.Product.id)
    )
    if category is not None:
        stock_q = stock_q.filter(models.Product.category == category)

    stock_sub = stock_q.subquery()

    # low stock and out of stock counts
    low_stock_count = (
        db.query(func.count())
        .select_from(models.Product)
        .join(stock_sub, stock_sub.c.id == models.Product.id)
        .filter(stock_sub.c.onhand <= models.Product.min_stock_level)
        .scalar()
        or 0
    )
    out_of_stock_count = (
        db.query(func.count())
        .select_from(models.Product)
        .join(stock_sub, stock_sub.c.id == models.Product.id)
        .filter(stock_sub.c.onhand == 0)
        .scalar()
        or 0
    )

    # total products that have on-hand > 0
    total_products_in_stock = (
        db.query(func.count())
        .select_from(models.Product)
        .join(stock_sub, stock_sub.c.id == models.Product.id)
        .filter(stock_sub.c.onhand > 0)
        .scalar()
        or 0
    )

    # Pending receipts / deliveries
    pending_statuses = [models.OperationStatus.draft, models.OperationStatus.waiting, models.OperationStatus.ready]
    pending_receipts = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(models.StockOperation.operation_type == models.OperationType.receipt, models.StockOperation.status.in_(pending_statuses))
        .scalar()
        or 0
    )
    pending_deliveries = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(models.StockOperation.operation_type == models.OperationType.delivery, models.StockOperation.status.in_(pending_statuses))
        .scalar()
        or 0
    )

    # Internal transfers scheduled (future) and not done
    now = datetime.utcnow()
    internal_transfers_scheduled = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(
            models.StockOperation.operation_type == models.OperationType.internal,
            models.StockOperation.status != models.OperationStatus.done,
            models.StockOperation.scheduled_date != None,
            models.StockOperation.scheduled_date > now,
        )
        .scalar()
        or 0
    )

    # internal transfers currently 'in progress' (waiting or ready)
    internal_in_progress = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(
            models.StockOperation.operation_type == models.OperationType.internal,
            models.StockOperation.status.in_([models.OperationStatus.waiting, models.OperationStatus.ready]),
        )
        .scalar()
        or 0
    )

    # Adjustments: done = approved, not-done = pending. No explicit 'rejected' status in enums.
    adjustments_approved = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(models.StockOperation.operation_type == models.OperationType.adjustment, models.StockOperation.status == models.OperationStatus.done)
        .scalar()
        or 0
    )
    adjustments_pending = (
        db.query(func.count())
        .select_from(models.StockOperation)
        .filter(models.StockOperation.operation_type == models.OperationType.adjustment, models.StockOperation.status != models.OperationStatus.done)
        .scalar()
        or 0
    )

    ops = (
        db.query(models.StockOperation.status, func.count(models.StockOperation.id))
        .group_by(models.StockOperation.status)
        .all()
    )
    ops_summary = {s.value: c for s, c in ops}

    return {
        "total_products": total_products,
        "total_products_in_stock": total_products_in_stock,
        "low_stock_count": int(low_stock_count),
        "out_of_stock_count": int(out_of_stock_count),
        "pending_receipts": int(pending_receipts),
        "pending_deliveries": int(pending_deliveries),
        "internal_transfers_scheduled": int(internal_transfers_scheduled),
        "operations": ops_summary,
    }
