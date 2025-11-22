"""Pydantic schemas for StockMaster and validators.

These schemas mirror the SQLAlchemy models in `models.py` and provide
request/response DTOs used by the API.
"""
from __future__ import annotations

from datetime import datetime
from decimal import Decimal
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, Field, ConfigDict
import re

# Import enums from models so Pydantic serializes/validates them correctly
from .types import OperationType, LocationType, PartnerType, OperationStatus

# Password policy: 1 uppercase, 1 lowercase, 1 digit, 1 special char
_password_re = re.compile(r"^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*\W).+")


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserCreate(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str]

    @validator("password")
    def password_policy(cls, v: str) -> str:
        if not _password_re.match(v):
            raise ValueError(
                "Password must contain 1 uppercase, 1 lowercase, 1 digit and 1 special character"
            )
        return v


class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class ProductBase(BaseModel):
    name: str
    sku: str
    category: Optional[str]
    unit_price: Optional[Decimal]
    min_stock_level: Optional[int] = 0


class ProductCreate(ProductBase):
    uom: Optional[str] = None
    initial_stock: Optional[Decimal] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[Decimal] = None
    min_stock_level: Optional[int] = None
    uom: Optional[str] = None


class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime]
    updated_at: Optional[datetime]
    uom: Optional[str]
    initial_stock: Optional[Decimal]

    model_config = ConfigDict(from_attributes=True)


class LocationBase(BaseModel):
    name: str
    type: LocationType


class LocationOut(LocationBase):
    id: int
    warehouse_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)


class StockOperationLineCreate(BaseModel):
    product_id: int
    demand_qty: Decimal


class StockOperationCreate(BaseModel):
    operation_type: OperationType
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    partner_id: Optional[int]
    scheduled_date: Optional[datetime]
    lines: List[StockOperationLineCreate]


class StockOperationLineOut(BaseModel):
    id: int
    product_id: int
    demand_qty: Decimal
    done_qty: Decimal

    model_config = ConfigDict(from_attributes=True)


class StockOperationOut(BaseModel):
    id: int
    reference: str
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    status: OperationStatus
    operation_type: OperationType
    partner_id: Optional[int]
    created_by_id: Optional[int]
    created_at: datetime
    updated_at: datetime
    scheduled_date: Optional[datetime]
    lines: List[StockOperationLineOut]

    model_config = ConfigDict(from_attributes=True)


class StockMoveOut(BaseModel):
    id: int
    product_id: int
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    quantity: Decimal
    date: datetime
    reference_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)


class StockQuantOut(BaseModel):
    id: int
    product_id: int
    location_id: int
    quantity: Decimal
    reserved_qty: Decimal
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class StockLedgerOut(BaseModel):
    id: int
    product_id: int
    location_id: Optional[int]
    change_qty: Decimal
    resulting_qty: Decimal
    move_id: Optional[int]
    operation_id: Optional[int]
    performed_by_id: Optional[int]
    reason: Optional[str]
    date: datetime

    model_config = ConfigDict(from_attributes=True)


class ReorderRuleCreate(BaseModel):
    product_id: int
    warehouse_id: Optional[int]
    min_qty: Decimal
    max_qty: Optional[Decimal]
    reorder_qty: Optional[Decimal]


class ReorderRuleOut(ReorderRuleCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class PartnerCreate(BaseModel):
    name: str
    partner_type: PartnerType
    contact: Optional[str]


class PartnerOut(PartnerCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)


class WarehouseCreate(BaseModel):
    name: str
    address: Optional[str]


class WarehouseOut(WarehouseCreate):
    id: int

    model_config = ConfigDict(from_attributes=True)
