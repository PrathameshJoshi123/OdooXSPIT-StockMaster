from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_partner(db: Session, p_in: schemas.PartnerCreate) -> models.Partner:
    p = models.Partner(name=p_in.name, partner_type=p_in.partner_type, contact=p_in.contact)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def list_partners(db: Session, skip: int = 0, limit: int = 100) -> List[models.Partner]:
    return db.query(models.Partner).offset(skip).limit(limit).all()


def get_partner(db: Session, p_id: int) -> models.Partner:
    p = db.query(models.Partner).get(p_id)
    if not p:
        raise NoResultFound(f"Partner {p_id} not found")
    return p


def update_partner(db: Session, p_id: int, changes: schemas.PartnerUpdate) -> models.Partner:
    p = get_partner(db, p_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(p, k):
            setattr(p, k, v)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


def delete_partner(db: Session, p_id: int) -> None:
    p = get_partner(db, p_id)
    db.delete(p)
    db.commit()
