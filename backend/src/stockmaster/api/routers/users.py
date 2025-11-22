from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return db.query(models.User).offset(skip).limit(limit).all()


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    u = db.query(models.User).get(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    return u


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, changes: schemas.UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    u = db.query(models.User).get(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(u, k):
            setattr(u, k, v)
    db.add(u)
    db.commit()
    db.refresh(u)
    return u


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    u = db.query(models.User).get(user_id)
    if not u:
        raise HTTPException(status_code=404, detail="User not found")
    db.delete(u)
    db.commit()
    return {"detail": "deleted"}
