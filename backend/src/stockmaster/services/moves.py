from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound
from sqlalchemy import or_

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


def list_moves(
    db: Session,
    skip: int = 0,
    limit: int = 100,
    document_type: Optional[str] = None,
    status: Optional[str] = None,
    warehouse_id: Optional[int] = None,
    product_id: Optional[int] = None,
) -> List[models.StockMove]:
    """Return stock moves with optional filters.

    Filters supported:
    - document_type: filters by the linked StockOperation.operation_type
    - status: filters by the linked StockOperation.status
    - warehouse_id: filters moves whose source or dest location belongs to the warehouse
    - product_id: filters by product
    """
    q = db.query(models.StockMove)

    if product_id is not None:
        q = q.filter(models.StockMove.product_id == product_id)

    if warehouse_id is not None:
        # Match moves where either the source or dest location belongs to the given warehouse
        q = q.filter(
            or_(
                models.StockMove.source_location.has(models.Location.warehouse_id == warehouse_id),
                models.StockMove.dest_location.has(models.Location.warehouse_id == warehouse_id),
            )
        )

    if status is not None:
        q = q.filter(models.StockMove.reference_operation.has(models.StockOperation.status == status))

    if document_type is not None:
        q = q.filter(models.StockMove.reference_operation.has(models.StockOperation.operation_type == document_type))

    return q.order_by(models.StockMove.date.desc()).offset(skip).limit(limit).all()


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
