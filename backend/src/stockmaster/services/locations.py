from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_location(db: Session, loc_in: schemas.LocationCreate) -> models.Location:
    loc = models.Location(name=loc_in.name, type=loc_in.type)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


def list_locations(db: Session, skip: int = 0, limit: int = 100) -> List[models.Location]:
    return db.query(models.Location).offset(skip).limit(limit).all()


def get_location(db: Session, loc_id: int) -> models.Location:
    loc = db.query(models.Location).get(loc_id)
    if not loc:
        raise NoResultFound(f"Location {loc_id} not found")
    return loc


def update_location(db: Session, loc_id: int, changes: schemas.LocationUpdate) -> models.Location:
    loc = get_location(db, loc_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(loc, k):
            setattr(loc, k, v)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


def delete_location(db: Session, loc_id: int) -> None:
    loc = get_location(db, loc_id)
    db.delete(loc)
    db.commit()
