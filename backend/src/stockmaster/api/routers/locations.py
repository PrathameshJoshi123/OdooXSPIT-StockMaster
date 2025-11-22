from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import locations as locations_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/locations", tags=["locations"])


@router.post("/", response_model=schemas.LocationOut, status_code=status.HTTP_201_CREATED)
def create_location(loc_in: schemas.LocationCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return locations_service.create_location(db, loc_in)


@router.get("/", response_model=List[schemas.LocationOut])
def list_locations(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return locations_service.list_locations(db, skip=skip, limit=limit)


@router.get("/{loc_id}", response_model=schemas.LocationOut)
def get_location(loc_id: int, db: Session = Depends(get_db)):
    try:
        return locations_service.get_location(db, loc_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Location not found")


@router.put("/{loc_id}", response_model=schemas.LocationOut)
def update_location(loc_id: int, changes: schemas.LocationUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return locations_service.update_location(db, loc_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Location not found")


@router.delete("/{loc_id}")
def delete_location(loc_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        locations_service.delete_location(db, loc_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="Location not found")
