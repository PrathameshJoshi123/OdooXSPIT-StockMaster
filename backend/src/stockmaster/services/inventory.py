"""Inventory service: reference generation, availability checks, validation -> ledger moves."""
from typing import Optional, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from decimal import Decimal

from .. import models, schemas


def generate_reference(db: Session, operation_type: str) -> str:
    # operation_type may be an Enum; use its value if so
    op_val = getattr(operation_type, "value", operation_type)
    like_pattern = f"{op_val}/%"
    last = (
        db.query(models.StockOperation)
        .filter(models.StockOperation.reference.like(like_pattern))
        .order_by(desc(models.StockOperation.id))
        .first()
    )
    if not last:
        return f"{op_val}/0001"
    try:
        suffix = last.reference.rsplit("/", 1)[-1]
        num = int(suffix)
        return f"{op_val}/{num+1:04d}"
    except Exception:
        return f"{op_val}/0001"


def create_operation(db: Session, op_in: schemas.StockOperationCreate) -> models.StockOperation:
    # generate a human-readable reference using operation type value
    ref = generate_reference(db, op_in.operation_type)
    op = models.StockOperation(
        reference=ref,
        source_loc_id=op_in.source_loc_id,
        dest_loc_id=op_in.dest_loc_id,
        scheduled_date=op_in.scheduled_date,
        status=models.OperationStatus.draft,
        # set operation_type and optional partner
        operation_type=op_in.operation_type,
        partner_id=getattr(op_in, "partner_id", None),
    )
    db.add(op)
    db.flush()

    for line in op_in.lines:
        opl = models.StockOperationLine(
            operation_id=op.id,
            product_id=line.product_id,
            demand_qty=Decimal(str(line.demand_qty)),
            done_qty=Decimal("0"),
        )
        db.add(opl)
    db.commit()
    db.refresh(op)
    return op


def _current_stock_for_product_at_location(db: Session, product_id: int, location_id: int) -> Decimal:
    incoming = (
        db.query(func.coalesce(func.sum(models.StockMove.quantity), 0))
        .filter(models.StockMove.product_id == product_id, models.StockMove.dest_loc_id == location_id)
        .scalar()
    )
    outgoing = (
        db.query(func.coalesce(func.sum(models.StockMove.quantity), 0))
        .filter(models.StockMove.product_id == product_id, models.StockMove.source_loc_id == location_id)
        .scalar()
    )
    return Decimal(incoming) - Decimal(outgoing)


def _reserved_stock_for_product_at_location(db: Session, product_id: int, location_id: int, exclude_operation_id: Optional[int] = None) -> Decimal:
    q = db.query(func.coalesce(func.sum(models.StockOperationLine.demand_qty - models.StockOperationLine.done_qty), 0))
    q = q.join(models.StockOperation, models.StockOperationLine.operation_id == models.StockOperation.id)
    q = q.filter(models.StockOperationLine.product_id == product_id)
    q = q.filter(models.StockOperation.source_loc_id == location_id)
    q = q.filter(models.StockOperation.status.in_([models.OperationStatus.draft, models.OperationStatus.waiting, models.OperationStatus.ready]))
    if exclude_operation_id:
        q = q.filter(models.StockOperation.id != exclude_operation_id)
    val = q.scalar() or 0
    return Decimal(val)


def check_availability(db: Session, operation_id: int) -> Tuple[bool, str]:
    op = db.query(models.StockOperation).get(operation_id)
    if not op:
        return False, "Operation not found"
    if not op.source_loc_id:
        return False, "Operation has no source location"
    source_loc = db.query(models.Location).get(op.source_loc_id)
    dest_loc = db.query(models.Location).get(op.dest_loc_id) if op.dest_loc_id else None
    is_delivery = source_loc and source_loc.type == models.LocationType.internal and dest_loc and dest_loc.type == models.LocationType.customer

    all_ok = True
    msgs = []
    for line in op.lines:
        product_id = line.product_id
        demand = Decimal(line.demand_qty)
        stock = _current_stock_for_product_at_location(db, product_id, op.source_loc_id)
        reserved = _reserved_stock_for_product_at_location(db, product_id, op.source_loc_id, exclude_operation_id=op.id)
        available = stock - reserved
        if available >= demand:
            msgs.append(f"Product {product_id}: available {available} >= demand {demand}")
        else:
            msgs.append(f"Product {product_id}: available {available} < demand {demand}")
            all_ok = False

    op.status = models.OperationStatus.ready if all_ok else models.OperationStatus.waiting
    db.add(op)
    db.commit()
    return all_ok, "; ".join(msgs)


def validate_operation(db: Session, operation_id: int, user_id: Optional[int] = None) -> Tuple[bool, str]:
    op = db.query(models.StockOperation).get(operation_id)
    if not op:
        return False, "Operation not found"
    if op.status == models.OperationStatus.done:
        return False, "Operation already done"
    created = []
    for line in op.lines:
        remaining = Decimal(line.demand_qty) - Decimal(line.done_qty)
        if remaining <= 0:
            continue
        mv = models.StockMove(
            product_id=line.product_id,
            source_loc_id=op.source_loc_id,
            dest_loc_id=op.dest_loc_id,
            quantity=remaining,
            reference_id=op.id,
        )
        db.add(mv)
        line.done_qty = line.demand_qty
        created.append(mv)

    op.status = models.OperationStatus.done
    db.add(op)
    db.commit()
    return True, f"Created {len(created)} stock moves"


def get_current_stock(db: Session, product_id: int, location_id: Optional[int] = None) -> Decimal:
    q_in = db.query(func.coalesce(func.sum(models.StockMove.quantity), 0)).filter(models.StockMove.product_id == product_id)
    q_out = db.query(func.coalesce(func.sum(models.StockMove.quantity), 0)).filter(models.StockMove.product_id == product_id)
    if location_id:
        q_in = q_in.filter(models.StockMove.dest_loc_id == location_id)
        q_out = q_out.filter(models.StockMove.source_loc_id == location_id)
    inc = q_in.scalar() or 0
    out = q_out.scalar() or 0
    return Decimal(inc) - Decimal(out)
