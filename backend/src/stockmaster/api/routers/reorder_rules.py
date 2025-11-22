from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import reorder_rules as reorder_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/reorder-rules", tags=["reorder_rules"])


@router.post("/", response_model=schemas.ReorderRuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(r_in: schemas.ReorderRuleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return reorder_service.create_rule(db, r_in)


@router.get("/", response_model=List[schemas.ReorderRuleOut])
def list_rules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return reorder_service.list_rules(db, skip=skip, limit=limit)


@router.get("/{r_id}", response_model=schemas.ReorderRuleOut)
def get_rule(r_id: int, db: Session = Depends(get_db)):
    try:
        return reorder_service.get_rule(db, r_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="ReorderRule not found")


@router.put("/{r_id}", response_model=schemas.ReorderRuleOut)
def update_rule(r_id: int, changes: schemas.ReorderRuleUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return reorder_service.update_rule(db, r_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="ReorderRule not found")


@router.delete("/{r_id}")
def delete_rule(r_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        reorder_service.delete_rule(db, r_id)
        return {"detail": "deleted"}
    except NoResultFound:
        raise HTTPException(status_code=404, detail="ReorderRule not found")
