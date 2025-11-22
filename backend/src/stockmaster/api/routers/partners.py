from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import partners as partners_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/partners", tags=["partners"])


@router.post("/", response_model=schemas.PartnerOut, status_code=status.HTTP_201_CREATED)
def create_partner(p_in: schemas.PartnerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return partners_service.create_partner(db, p_in)


@router.get("/", response_model=List[schemas.PartnerOut])
def list_partners(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return partners_service.list_partners(db, skip=skip, limit=limit)


@router.get("/{p_id}", response_model=schemas.PartnerOut)
def get_partner(p_id: int, db: Session = Depends(get_db)):
    try:
        return partners_service.get_partner(db, p_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Partner not found")


@router.put("/{p_id}", response_model=schemas.PartnerOut)
def update_partner(p_id: int, changes: schemas.PartnerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return partners_service.update_partner(db, p_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Partner not found")


@router.delete("/{p_id}")
def delete_partner(p_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        partners_service.delete_partner(db, p_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Partner not found")
