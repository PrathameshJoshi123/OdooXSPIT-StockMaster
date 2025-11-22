from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/reorder-rules", tags=["reorder_rules"])


@router.post("/", response_model=schemas.ReorderRuleOut, status_code=status.HTTP_201_CREATED)
def create_rule(r_in: schemas.ReorderRuleCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = models.ReorderRule(product_id=r_in.product_id, warehouse_id=r_in.warehouse_id, min_qty=r_in.min_qty, max_qty=r_in.max_qty, reorder_qty=r_in.reorder_qty)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.get("/", response_model=List[schemas.ReorderRuleOut])
def list_rules(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.ReorderRule).offset(skip).limit(limit).all()


@router.get("/{r_id}", response_model=schemas.ReorderRuleOut)
def get_rule(r_id: int, db: Session = Depends(get_db)):
    r = db.query(models.ReorderRule).get(r_id)
    if not r:
        raise HTTPException(status_code=404, detail="ReorderRule not found")
    return r


@router.put("/{r_id}", response_model=schemas.ReorderRuleOut)
def update_rule(r_id: int, changes: schemas.ReorderRuleUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(models.ReorderRule).get(r_id)
    if not r:
        raise HTTPException(status_code=404, detail="ReorderRule not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(r, k):
            setattr(r, k, v)
    db.add(r)
    db.commit()
    db.refresh(r)
    return r


@router.delete("/{r_id}")
def delete_rule(r_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = db.query(models.ReorderRule).get(r_id)
    if not r:
        raise HTTPException(status_code=404, detail="ReorderRule not found")
    db.delete(r)
    db.commit()
    return {"detail": "deleted"}
