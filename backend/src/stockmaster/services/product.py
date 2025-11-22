from datetime import datetime
from typing import List, Optional

from sqlalchemy.orm import Session
from sqlalchemy.exc import NoResultFound

from .. import models, schemas
from ..models import LocationType


def create_product(
    db: Session,
    product_in: schemas.ProductCreate,
    initial_stock: Optional[float] = None,
    dest_loc_id: Optional[int] = None,
) -> models.Product:
    product = models.Product(
        name=product_in.name,
        sku=product_in.sku,
        category=product_in.category,
        unit_price=product_in.unit_price,
        min_stock_level=product_in.min_stock_level,
        uom=product_in.uom,
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    # If initial stock provided, create an incoming StockMove to seed inventory
    if initial_stock and float(initial_stock) > 0:
        # determine destination location
        if dest_loc_id:
            dest = db.query(models.Location).filter(models.Location.id == dest_loc_id).first()
            if not dest:
                raise NoResultFound(f"dest_loc_id {dest_loc_id} not found")
            dest_id = dest.id
        else:
            # pick the first internal location, otherwise create a default
            dest = db.query(models.Location).filter(models.Location.type == LocationType.internal).first()
            if not dest:
                dest = models.Location(name="Default Internal", type=LocationType.internal)
                db.add(dest)
                db.commit()
                db.refresh(dest)
            dest_id = dest.id

        move = models.StockMove(
            product_id=product.id,
            source_loc_id=None,
            dest_loc_id=dest_id,
            quantity=initial_stock,
            date=datetime.utcnow(),
            reference_id=None,
        )
        db.add(move)
        db.commit()
        db.refresh(move)

    return product


def get_product(db: Session, product_id: int) -> Optional[models.Product]:
    return db.query(models.Product).filter(models.Product.id == product_id).first()


def list_products(db: Session, skip: int = 0, limit: int = 100) -> List[models.Product]:
    return db.query(models.Product).offset(skip).limit(limit).all()


def update_product(db: Session, product: models.Product, changes: schemas.ProductUpdate) -> models.Product:
    for field, value in changes.__dict__.items():
        if value is not None and hasattr(product, field):
            setattr(product, field, value)
    db.add(product)
    db.commit()
    db.refresh(product)
    return product


def delete_product(db: Session, product: models.Product) -> None:
    db.delete(product)
    db.commit()
