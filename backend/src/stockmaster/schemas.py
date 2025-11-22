"""Pydantic schemas for StockMaster and validators."""
from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, EmailStr, validator, Field, ConfigDict
import re

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
    unit_price: Optional[float]
    min_stock_level: Optional[int] = 0


class ProductCreate(ProductBase):
    uom: Optional[str] = None
    initial_stock: Optional[float] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    sku: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    min_stock_level: Optional[int] = None
    uom: Optional[str] = None


class ProductOut(ProductBase):
    id: int
    created_at: Optional[datetime]

    model_config = ConfigDict(from_attributes=True)


class LocationBase(BaseModel):
    name: str
    type: str


class LocationOut(LocationBase):
    id: int

    model_config = ConfigDict(from_attributes=True)


class StockOperationLineCreate(BaseModel):
    product_id: int
    demand_qty: float


class StockOperationCreate(BaseModel):
    operation_type: str  # e.g., 'WH/IN' or 'WH/OUT' prefix used in reference generation
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    scheduled_date: Optional[datetime]
    lines: List[StockOperationLineCreate]


class StockOperationLineOut(BaseModel):
    id: int
    product_id: int
    demand_qty: float
    done_qty: float

    model_config = ConfigDict(from_attributes=True)


class StockOperationOut(BaseModel):
    id: int
    reference: str
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    status: str
    scheduled_date: Optional[datetime]
    lines: List[StockOperationLineOut]

    model_config = ConfigDict(from_attributes=True)


class StockMoveOut(BaseModel):
    id: int
    product_id: int
    source_loc_id: Optional[int]
    dest_loc_id: Optional[int]
    quantity: float
    date: datetime
    reference_id: Optional[int]

    model_config = ConfigDict(from_attributes=True)
