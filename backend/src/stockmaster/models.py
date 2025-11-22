"""SQLAlchemy models for StockMaster.

Matches the exact schema provided by the user.
"""
import enum
from datetime import datetime

from sqlalchemy import (
    Column,
    Integer,
    String,
    DateTime,
    Enum,
    ForeignKey,
    Numeric,
    Index,
)
from sqlalchemy.orm import relationship

from .database import Base


class LocationType(enum.Enum):
    vendor = "vendor"
    customer = "customer"
    internal = "internal"
    inventory_loss = "inventory_loss"


class OperationStatus(enum.Enum):
    draft = "draft"
    waiting = "waiting"
    ready = "ready"
    done = "done"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    name = Column(String(255), nullable=False)
    sku = Column(String(128), unique=True, nullable=False, index=True)
    category = Column(String(128), nullable=True)
    uom = Column(String(64), nullable=True)
    unit_price = Column(Numeric(12, 2), nullable=True)
    min_stock_level = Column(Integer, default=0, nullable=False)

    moves = relationship("StockMove", back_populates="product", cascade="all, delete-orphan")
    operation_lines = relationship(
        "StockOperationLine", back_populates="product", cascade="all, delete-orphan"
    )


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(LocationType), nullable=False, default=LocationType.internal)

    outgoing_moves = relationship(
        "StockMove",
        back_populates="source_location",
        foreign_keys="StockMove.source_loc_id",
    )
    incoming_moves = relationship(
        "StockMove",
        back_populates="dest_location",
        foreign_keys="StockMove.dest_loc_id",
    )


class StockOperation(Base):
    __tablename__ = "stockoperations"

    id = Column(Integer, primary_key=True, index=True)
    reference = Column(String(64), nullable=False, unique=True, index=True)
    source_loc_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    dest_loc_id = Column(Integer, ForeignKey("locations.id"), nullable=True)
    status = Column(Enum(OperationStatus), nullable=False, default=OperationStatus.draft)
    scheduled_date = Column(DateTime, nullable=True)

    source_location = relationship("Location", foreign_keys=[source_loc_id])
    dest_location = relationship("Location", foreign_keys=[dest_loc_id])

    lines = relationship("StockOperationLine", back_populates="operation", cascade="all, delete-orphan")
    moves = relationship("StockMove", back_populates="reference_operation")


class StockOperationLine(Base):
    __tablename__ = "stockoperationlines"

    id = Column(Integer, primary_key=True, index=True)
    operation_id = Column(
        Integer, ForeignKey("stockoperations.id", ondelete="CASCADE"), nullable=False, index=True
    )
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    demand_qty = Column(Numeric(14, 4), nullable=False, default=0)
    done_qty = Column(Numeric(14, 4), nullable=False, default=0)

    operation = relationship("StockOperation", back_populates="lines")
    product = relationship("Product", back_populates="operation_lines")


class StockMove(Base):
    __tablename__ = "stockmoves"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    source_loc_id = Column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    dest_loc_id = Column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    quantity = Column(Numeric(14, 4), nullable=False)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)
    reference_id = Column(Integer, ForeignKey("stockoperations.id"), nullable=True, index=True)

    product = relationship("Product", back_populates="moves")
    source_location = relationship("Location", foreign_keys=[source_loc_id])
    dest_location = relationship("Location", foreign_keys=[dest_loc_id])
    reference_operation = relationship("StockOperation", back_populates="moves")


# Optional useful index
Index("ix_stockmoves_product_date", StockMove.product_id, StockMove.date)
