from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import warehouses as warehouses_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/warehouses", tags=["warehouses"])


@router.post("/", response_model=schemas.WarehouseOut, status_code=status.HTTP_201_CREATED)
def create_warehouse(w_in: schemas.WarehouseCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return warehouses_service.create_warehouse(db, w_in)


@router.get("/", response_model=List[schemas.WarehouseOut])
def list_warehouses(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return warehouses_service.list_warehouses(db, skip=skip, limit=limit)


@router.get("/{w_id}", response_model=schemas.WarehouseOut)
def get_warehouse(w_id: int, db: Session = Depends(get_db)):
    try:
        return warehouses_service.get_warehouse(db, w_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Warehouse not found")


@router.put("/{w_id}", response_model=schemas.WarehouseOut)
def update_warehouse(w_id: int, changes: schemas.WarehouseUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return warehouses_service.update_warehouse(db, w_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Warehouse not found")


@router.delete("/{w_id}")
def delete_warehouse(w_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        warehouses_service.delete_warehouse(db, w_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Warehouse not found")
