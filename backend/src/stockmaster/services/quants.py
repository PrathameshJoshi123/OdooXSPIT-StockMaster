from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_quant(db: Session, q_in: schemas.StockQuantCreate) -> models.StockQuant:
    q = models.StockQuant(product_id=q_in.product_id, location_id=q_in.location_id, quantity=q_in.quantity)
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


def list_quants(db: Session, skip: int = 0, limit: int = 100) -> List[models.StockQuant]:
    return db.query(models.StockQuant).offset(skip).limit(limit).all()


def get_quant(db: Session, quant_id: int) -> models.StockQuant:
    q = db.query(models.StockQuant).get(quant_id)
    if not q:
        raise NoResultFound(f"StockQuant {quant_id} not found")
    return q


def update_quant(db: Session, quant_id: int, changes: schemas.StockQuantUpdate) -> models.StockQuant:
    q = get_quant(db, quant_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(q, k):
            setattr(q, k, v)
    db.add(q)
    db.commit()
    db.refresh(q)
    return q


def delete_quant(db: Session, quant_id: int) -> None:
    q = get_quant(db, quant_id)
    db.delete(q)
    db.commit()
