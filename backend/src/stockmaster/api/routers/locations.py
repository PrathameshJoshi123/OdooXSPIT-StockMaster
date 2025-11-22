from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=schemas.LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(loc_in: schemas.LocationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    loc = models.Location(name=loc_in.name, type=loc_in.type)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.get("/", response_model=List[schemas.LocationOut])
def list_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.Location).offset(skip).limit(limit).all()


@router.get("/{loc_id}", response_model=schemas.LocationOut)
def get_location(loc_id: int, db: Session = Depends(get_db)):
    loc = db.query(models.Location).get(loc_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return loc


@router.put("/{loc_id}", response_model=schemas.LocationOut)
def update_location(loc_id: int, changes: schemas.LocationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    loc = db.query(models.Location).get(loc_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(loc, k):
            setattr(loc, k, v)
    db.add(loc)
    db.commit()
    db.refresh(loc)
    return loc


@router.delete("/{loc_id}")
def delete_location(loc_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    loc = db.query(models.Location).get(loc_id)
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    db.delete(loc)
    db.commit()
    return {"detail": "deleted"}
