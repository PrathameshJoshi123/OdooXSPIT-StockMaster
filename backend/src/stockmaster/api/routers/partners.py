from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/partners", tags=["partners"])


@router.post("/", response_model=schemas.PartnerOut, status_code=status.HTTP_201_CREATED)
def create_partner(p_in: schemas.PartnerCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = models.Partner(name=p_in.name, partner_type=p_in.partner_type, contact=p_in.contact)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.get("/", response_model=List[schemas.PartnerOut])
def list_partners(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Partner).offset(skip).limit(limit).all()


@router.get("/{p_id}", response_model=schemas.PartnerOut)
def get_partner(p_id: int, db: Session = Depends(get_db)):
    p = db.query(models.Partner).get(p_id)
    if not p:
        raise HTTPException(status_code=404, detail="Partner not found")
    return p


@router.put("/{p_id}", response_model=schemas.PartnerOut)
def update_partner(p_id: int, changes: schemas.PartnerUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(models.Partner).get(p_id)
    if not p:
        raise HTTPException(status_code=404, detail="Partner not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(p, k):
            setattr(p, k, v)
    db.add(p)
    db.commit()
    db.refresh(p)
    return p


@router.delete("/{p_id}")
def delete_partner(p_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    p = db.query(models.Partner).get(p_id)
    if not p:
        raise HTTPException(status_code=404, detail="Partner not found")
    db.delete(p)
    db.commit()
    return {"detail": "deleted"}
