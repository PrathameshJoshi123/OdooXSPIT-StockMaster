from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.post("/", response_model=schemas.StockLedgerOut, status_code=status.HTTP_201_CREATED)
def create_ledger(entry: schemas.StockLedgerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    l = models.StockLedger(
        product_id=entry.product_id,
        location_id=entry.location_id,
        change_qty=entry.change_qty,
        resulting_qty=entry.resulting_qty,
        move_id=entry.move_id,
        operation_id=entry.operation_id,
        performed_by_id=entry.performed_by_id,
        reason=entry.reason,
    )
    db.add(l)
    db.commit()
    db.refresh(l)
    return l


@router.get("/", response_model=List[schemas.StockLedgerOut])
def list_ledger(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.StockLedger).order_by(models.StockLedger.date.desc()).offset(skip).limit(limit).all()


@router.get("/{entry_id}", response_model=schemas.StockLedgerOut)
def get_ledger(entry_id: int, db: Session = Depends(get_db)):
    l = db.query(models.StockLedger).get(entry_id)
    if not l:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")
    return l


@router.put("/{entry_id}", response_model=schemas.StockLedgerOut)
def update_ledger(entry_id: int, changes: schemas.StockLedgerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    l = db.query(models.StockLedger).get(entry_id)
    if not l:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(l, k):
            setattr(l, k, v)
    db.add(l)
    db.commit()
    db.refresh(l)
    return l


@router.delete("/{entry_id}")
def delete_ledger(entry_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    l = db.query(models.StockLedger).get(entry_id)
    if not l:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")
    db.delete(l)
    db.commit()
    return {"detail": "deleted"}
