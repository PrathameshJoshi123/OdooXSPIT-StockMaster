from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import quants as quants_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/quants", tags=["quants"])


@router.post("/", response_model=schemas.StockQuantOut, status_code=status.HTTP_201_CREATED)
def create_quant(q_in: schemas.StockQuantCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return quants_service.create_quant(db, q_in)


@router.get("/", response_model=List[schemas.StockQuantOut])
def list_quants(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return quants_service.list_quants(db, skip=skip, limit=limit)


@router.get("/{quant_id}", response_model=schemas.StockQuantOut)
def get_quant(quant_id: int, db: Session = Depends(get_db)):
    try:
        return quants_service.get_quant(db, quant_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockQuant not found")


@router.put("/{quant_id}", response_model=schemas.StockQuantOut)
def update_quant(quant_id: int, changes: schemas.StockQuantUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return quants_service.update_quant(db, quant_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockQuant not found")


@router.delete("/{quant_id}")
def delete_quant(quant_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        quants_service.delete_quant(db, quant_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockQuant not found")
