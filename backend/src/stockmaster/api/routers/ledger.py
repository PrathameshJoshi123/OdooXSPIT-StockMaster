from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import ledger as ledger_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/ledger", tags=["ledger"])


@router.post("/", response_model=schemas.StockLedgerOut, status_code=status.HTTP_201_CREATED)
def create_ledger(entry: schemas.StockLedgerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return ledger_service.create_ledger(db, entry)


@router.get("/", response_model=List[schemas.StockLedgerOut])
def list_ledger(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return ledger_service.list_ledger(db, skip=skip, limit=limit)


@router.get("/{entry_id}", response_model=schemas.StockLedgerOut)
def get_ledger(entry_id: int, db: Session = Depends(get_db)):
    try:
        return ledger_service.get_ledger(db, entry_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")


@router.put("/{entry_id}", response_model=schemas.StockLedgerOut)
def update_ledger(entry_id: int, changes: schemas.StockLedgerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return ledger_service.update_ledger(db, entry_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")


@router.delete("/{entry_id}")
def delete_ledger(entry_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        ledger_service.delete_ledger(db, entry_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockLedger entry not found")
