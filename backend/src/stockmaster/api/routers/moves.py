from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import moves as moves_service
from sqlalchemy.exc import NoResultFound

router = APIRouter(prefix="/moves", tags=["moves"])


@router.post("/", response_model=schemas.StockMoveOut, status_code=status.HTTP_201_CREATED)
def create_move(mv_in: schemas.StockMoveCreate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    return moves_service.create_move(db, mv_in)


@router.get("/", response_model=List[schemas.StockMoveOut])
def list_moves(
    skip: int = 0,
    limit: int = 100,
    document_type: Optional[str] = None,
    status_filter: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    return moves_service.list_moves(
        db,
        skip=skip,
        limit=limit,
        document_type=document_type,
        status=status_filter,
        warehouse_id=warehouse_id,
        product_id=product_id,
    )


@router.get("/{move_id}", response_model=schemas.StockMoveOut)
def get_move(move_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return moves_service.get_move(db, move_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockMove not found")


@router.put("/{move_id}", response_model=schemas.StockMoveOut)
def update_move(move_id: int, changes: schemas.StockMoveUpdate, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        return moves_service.update_move(db, move_id, changes)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockMove not found")


@router.delete("/{move_id}")
def delete_move(move_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    try:
        moves_service.delete_move(db, move_id)
    except NoResultFound:
        raise HTTPException(status_code=404, detail="StockMove not found")
    return None
