from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_ledger(db: Session, entry: schemas.StockLedgerCreate) -> models.StockLedger:
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


def list_ledger(db: Session, skip: int = 0, limit: int = 100) -> List[models.StockLedger]:
    return db.query(models.StockLedger).order_by(models.StockLedger.date.desc()).offset(skip).limit(limit).all()


def get_ledger(db: Session, entry_id: int) -> models.StockLedger:
    l = db.query(models.StockLedger).get(entry_id)
    if not l:
        raise NoResultFound(f"StockLedger {entry_id} not found")
    return l


def update_ledger(db: Session, entry_id: int, changes: schemas.StockLedgerUpdate) -> models.StockLedger:
    l = get_ledger(db, entry_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(l, k):
            setattr(l, k, v)
    db.add(l)
    db.commit()
    db.refresh(l)
    return l


def delete_ledger(db: Session, entry_id: int) -> None:
    l = get_ledger(db, entry_id)
    db.delete(l)
    db.commit()
