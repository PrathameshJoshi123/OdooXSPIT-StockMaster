from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/quants", tags=["quants"])


@router.post("/", response_model=schemas.StockQuantOut, status_code=status.HTTP_201_CREATED)
def create_quant(q_in: schemas.StockQuantCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    # upsert-like behaviour could be added, but keep simple
    q = models.StockQuant(product_id=q_in.product_id, location_id=q_in.location_id, quantity=q_in.quantity)
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.get("/", response_model=List[schemas.StockQuantOut])
def list_quants(skip: int = 0, limit: int = 200, db: Session = Depends(get_db)):
    return db.query(models.StockQuant).offset(skip).limit(limit).all()


@router.get("/{quant_id}", response_model=schemas.StockQuantOut)
def get_quant(quant_id: int, db: Session = Depends(get_db)):
    q = db.query(models.StockQuant).get(quant_id)
    if not q:
        raise HTTPException(status_code=404, detail="StockQuant not found")
    return q


@router.put("/{quant_id}", response_model=schemas.StockQuantOut)
def update_quant(quant_id: int, changes: schemas.StockQuantUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(models.StockQuant).get(quant_id)
    if not q:
        raise HTTPException(status_code=404, detail="StockQuant not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(q, k):
            setattr(q, k, v)
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


@router.delete("/{quant_id}")
def delete_quant(quant_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    q = db.query(models.StockQuant).get(quant_id)
    if not q:
        raise HTTPException(status_code=404, detail="StockQuant not found")
    db.delete(q)
    db.commit()
    return {"detail": "deleted"}
