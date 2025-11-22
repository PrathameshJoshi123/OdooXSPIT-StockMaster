"""Operations router: create/check/validate operations."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import inventory as inventory_service
from ...types import OperationType
from typing import List, Optional
from sqlalchemy import or_
from ... import models
from ...services import inventory as inventory_service

router = APIRouter(prefix="/operations", tags=["operations"])


@router.post("/", response_model=schemas.StockOperationOut)
def create_operation(op_in: schemas.StockOperationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # persist who created the operation
    user_id = getattr(current_user, "id", None)
    op = inventory_service.create_operation(db, op_in, created_by_id=user_id)
    db.refresh(op)
    return op


@router.post("/receipts", response_model=schemas.StockOperationOut)
def create_receipt(receipt_in: schemas.StockOperationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # Force operation_type to 'receipt' and require partner_id (supplier)
    data = receipt_in.model_dump()
    data["operation_type"] = OperationType.receipt
    if not data.get("partner_id"):
        # partner (supplier) should be provided for receipts
        raise HTTPException(status_code=400, detail="partner_id (supplier) is required for receipts")
    op_in = schemas.StockOperationCreate(**data)
    user_id = getattr(current_user, "id", None)
    op = inventory_service.create_operation(db, op_in, created_by_id=user_id)
    db.refresh(op)
    return op


@router.post("/{operation_id}/check")
def check_availability(operation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ok, msg = inventory_service.check_availability(db, operation_id)
    return {"ready": ok, "message": msg}


@router.post("/{operation_id}/validate")
def validate_operation(operation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    ok, msg = inventory_service.validate_operation(db, operation_id, user_id=current_user.id)
    if not ok:
        raise HTTPException(status_code=400, detail=msg)
    return {"ok": True, "message": msg}


@router.get("/")
def list_operations(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    status: Optional[str] = None,
    partner_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    q = db.query(models.StockOperation)
    if partner_id is not None:
        q = q.filter(models.StockOperation.partner_id == partner_id)
    if status is not None:
        q = q.filter(models.StockOperation.status == status)
    if search:
        like = f"%{search}%"
        q = q.filter(or_(models.StockOperation.reference.ilike(like), models.StockOperation.partner.has(models.Partner.name.ilike(like))))
    ops = q.order_by(models.StockOperation.created_at.desc()).offset(skip).limit(limit).all()

    # Build lightweight dicts including partner/location names to simplify frontend rendering
    out = []
    for op in ops:
        out.append(
            {
                "id": op.id,
                "reference": op.reference,
                "source_loc_id": op.source_loc_id,
                "source_location_name": op.source_location.name if op.source_location else None,
                "dest_loc_id": op.dest_loc_id,
                "dest_location_name": op.dest_location.name if op.dest_location else None,
                "partner_id": op.partner_id,
                "partner_name": op.partner.name if getattr(op, 'partner', None) else None,
                "scheduled_date": op.scheduled_date,
                "status": op.status.value if op.status else None,
                "operation_type": op.operation_type.value if op.operation_type else None,
                "lines": [
                    {
                        "id": l.id,
                        "product_id": l.product_id,
                        "demand_qty": float(l.demand_qty),
                        "done_qty": float(l.done_qty),
                    }
                    for l in op.lines
                ],
            }
        )
    return out


@router.get("/{operation_id}", response_model=schemas.StockOperationOut)
def get_operation(operation_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    op = db.query(models.StockOperation).get(operation_id)
    if not op:
        raise HTTPException(status_code=404, detail="StockOperation not found")
    return op



@router.patch("/{operation_id}", response_model=schemas.StockOperationOut)
def update_operation(operation_id: int, changes: schemas.StockOperationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    data = changes.model_dump()
    op = inventory_service.update_operation(db, operation_id, data)
    if not op:
        raise HTTPException(status_code=404, detail="StockOperation not found")
    return op
