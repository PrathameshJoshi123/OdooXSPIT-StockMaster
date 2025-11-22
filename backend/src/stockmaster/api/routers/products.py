from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db, get_current_user
from ...services import product as product_service

router = APIRouter(prefix="/products", tags=["products"])


@router.post("/", response_model=schemas.ProductOut, status_code=status.HTTP_201_CREATED)
def create_product(
    product_in: schemas.ProductCreate,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user),
):
    # check SKU uniqueness
    existing = db.query(product_service.models.Product).filter_by(sku=product_in.sku).first()
    if existing:
        raise HTTPException(status_code=400, detail="SKU already exists")
    product = product_service.create_product(db, product_in, initial_stock=product_in.initial_stock)
    return product


@router.get("/", response_model=List[schemas.ProductOut])
def list_products(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return product_service.list_products(db, skip=skip, limit=limit)


@router.get("/{product_id}", response_model=schemas.ProductOut)
def get_product(product_id: int, db: Session = Depends(get_db)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


@router.put("/{product_id}", response_model=schemas.ProductOut)
def update_product(product_id: int, changes: schemas.ProductUpdate, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    updated = product_service.update_product(db, product, changes)
    return updated


@router.delete("/{product_id}")
def delete_product(product_id: int, db: Session = Depends(get_db), current_user = Depends(get_current_user)):
    product = product_service.get_product(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    product_service.delete_product(db, product)
    return {"detail": "deleted"}
