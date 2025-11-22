from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def list_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    return db.query(models.User).offset(skip).limit(limit).all()


def get_user(db: Session, user_id: int) -> models.User:
    u = db.query(models.User).get(user_id)
    if not u:
        raise NoResultFound(f"User {user_id} not found")
    return u


def update_user(db: Session, user_id: int, changes: schemas.UserUpdate) -> models.User:
    u = get_user(db, user_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(u, k):
            setattr(u, k, v)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


def delete_user(db: Session, user_id: int) -> None:
    u = get_user(db, user_id)
    db.delete(u)
    db.commit()
