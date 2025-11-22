from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_rule(db: Session, r_in: schemas.ReorderRuleCreate) -> models.ReorderRule:
    r = models.ReorderRule(product_id=r_in.product_id, warehouse_id=r_in.warehouse_id, min_qty=r_in.min_qty, max_qty=r_in.max_qty, reorder_qty=r_in.reorder_qty)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def list_rules(db: Session, skip: int = 0, limit: int = 100) -> List[models.ReorderRule]:
    return db.query(models.ReorderRule).offset(skip).limit(limit).all()


def get_rule(db: Session, r_id: int) -> models.ReorderRule:
    r = db.query(models.ReorderRule).get(r_id)
    if not r:
        raise NoResultFound(f"ReorderRule {r_id} not found")
    return r


def update_rule(db: Session, r_id: int, changes: schemas.ReorderRuleUpdate) -> models.ReorderRule:
    r = get_rule(db, r_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(r, k):
            setattr(r, k, v)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


def delete_rule(db: Session, r_id: int) -> None:
    r = get_rule(db, r_id)
    db.delete(r)
    db.commit()
