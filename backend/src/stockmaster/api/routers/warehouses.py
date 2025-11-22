from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.post("/", response_model=schemas.WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(w_in: schemas.WarehouseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    w = models.Warehouse(name=w_in.name, address=w_in.address)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


@router.get("/", response_model=List[schemas.WarehouseOut])
def list_warehouses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Warehouse).offset(skip).limit(limit).all()


@router.get("/{w_id}", response_model=schemas.WarehouseOut)
def get_warehouse(w_id: int, db: Session = Depends(get_db)):
    w = db.query(models.Warehouse).get(w_id)
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return w


@router.put("/{w_id}", response_model=schemas.WarehouseOut)
def update_warehouse(w_id: int, changes: schemas.WarehouseUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    w = db.query(models.Warehouse).get(w_id)
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(w, k):
            setattr(w, k, v)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


@router.delete("/{w_id}")
def delete_warehouse(w_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    w = db.query(models.Warehouse).get(w_id)
    if not w:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    db.delete(w)
    db.commit()
    return {"detail": "deleted"}
