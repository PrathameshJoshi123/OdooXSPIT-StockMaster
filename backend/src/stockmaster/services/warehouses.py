from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_warehouse(db: Session, w_in: schemas.WarehouseCreate) -> models.Warehouse:
    w = models.Warehouse(name=w_in.name, address=w_in.address)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


def list_warehouses(db: Session, skip: int = 0, limit: int = 100) -> List[models.Warehouse]:
    return db.query(models.Warehouse).offset(skip).limit(limit).all()


def get_warehouse(db: Session, w_id: int) -> models.Warehouse:
    w = db.query(models.Warehouse).get(w_id)
    if not w:
        raise NoResultFound(f"Warehouse {w_id} not found")
    return w


def update_warehouse(db: Session, w_id: int, changes: schemas.WarehouseUpdate) -> models.Warehouse:
    w = get_warehouse(db, w_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(w, k):
            setattr(w, k, v)
    db.add(w)
    db.commit()
    db.refresh(w)
    return w


def delete_warehouse(db: Session, w_id: int) -> None:
    w = get_warehouse(db, w_id)
    db.delete(w)
    db.commit()
