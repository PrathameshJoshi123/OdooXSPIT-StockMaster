from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas, models
from ...deps import get_db, get_current_user

router = APIRouter(prefix="/moves", tags=["moves"])


@router.post("/", response_model=schemas.StockMoveOut, status_code=status.HTTP_201_CREATED)
def create_move(mv_in: schemas.StockMoveCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    mv = models.StockMove(
        product_id=mv_in.product_id,
        source_loc_id=mv_in.source_loc_id,
        dest_loc_id=mv_in.dest_loc_id,
        quantity=mv_in.quantity,
    )
    db.add(mv)
    db.commit()
    db.refresh(mv)
    return mv


@router.get("/", response_model=List[schemas.StockMoveOut])
def list_moves(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(models.StockMove).order_by(models.StockMove.date.desc()).offset(skip).limit(limit).all()


@router.get("/{move_id}", response_model=schemas.StockMoveOut)
def get_move(move_id: int, db: Session = Depends(get_db)):
    mv = db.query(models.StockMove).get(move_id)
    if not mv:
        raise HTTPException(status_code=404, detail="StockMove not found")
    return mv


@router.put("/{move_id}", response_model=schemas.StockMoveOut)
def update_move(move_id: int, changes: schemas.StockMoveUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    mv = db.query(models.StockMove).get(move_id)
    if not mv:
        raise HTTPException(status_code=404, detail="StockMove not found")
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(mv, k):
            setattr(mv, k, v)
    db.add(mv)
    db.commit()
    db.refresh(mv)
    return mv


@router.delete("/{move_id}")
def delete_move(move_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    mv = db.query(models.StockMove).get(move_id)
    if not mv:
        raise HTTPException(status_code=404, detail="StockMove not found")
    db.delete(mv)
    db.commit()
    return {"detail": "deleted"}
