from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import users as users_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/users", tags=["users"])


@router.get("/", response_model=List[schemas.UserOut])
def list_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return users_service.list_users(db, skip=skip, limit=limit)


@router.get("/{user_id}", response_model=schemas.UserOut)
def get_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return users_service.get_user(db, user_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="User not found")


@router.put("/{user_id}", response_model=schemas.UserOut)
def update_user(user_id: int, changes: schemas.UserUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return users_service.update_user(db, user_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="User not found")


@router.delete("/{user_id}")
def delete_user(user_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        users_service.delete_user(db, user_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="User not found")
