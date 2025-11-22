from typing import List
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas


def create_move(db: Session, mv_in: schemas.StockMoveCreate) -> models.StockMove:
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


def list_moves(db: Session, skip: int = 0, limit: int = 100) -> List[models.StockMove]:
    return db.query(models.StockMove).order_by(models.StockMove.date.desc()).offset(skip).limit(limit).all()


def get_move(db: Session, move_id: int) -> models.StockMove:
    mv = db.query(models.StockMove).get(move_id)
    if not mv:
        raise NoResultFound(f"StockMove {move_id} not found")
    return mv


def update_move(db: Session, move_id: int, changes: schemas.StockMoveUpdate) -> models.StockMove:
    mv = get_move(db, move_id)
    for k, v in changes.__dict__.items():
        if v is not None and hasattr(mv, k):
            setattr(mv, k, v)
    db.add(mv)
    db.commit()
    db.refresh(mv)
    return mv


def delete_move(db: Session, move_id: int) -> None:
    mv = get_move(db, move_id)
    db.delete(mv)
    db.commit()
