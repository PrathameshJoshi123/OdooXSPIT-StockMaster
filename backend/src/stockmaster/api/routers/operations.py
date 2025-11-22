"""Operations router: create/check/validate operations."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import inventory as inventory_service
from ...types import OperationType

router = APIRouter(prefix="/operations", tags=["operations"])


@router.post("/", response_model=schemas.StockOperationOut)
def create_operation(op_in: schemas.StockOperationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    op = inventory_service.create_operation(db, op_in)
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
    op = inventory_service.create_operation(db, op_in)
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
