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
    UniqueConstraint,
    CheckConstraint,
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


class OperationType(enum.Enum):
    receipt = "receipt"
    delivery = "delivery"
    internal = "internal"
    adjustment = "adjustment"


class PartnerType(enum.Enum):
    vendor = "vendor"
    customer = "customer"


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
    # Optional initial stock value provided at product creation. Real inventory
    # is tracked in `StockQuant` per location; this can be used to seed
    # initial quants during product creation/migration.
    initial_stock = Column(Numeric(14, 4), nullable=True, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    moves = relationship("StockMove", back_populates="product", cascade="all, delete-orphan")
    operation_lines = relationship(
        "StockOperationLine", back_populates="product", cascade="all, delete-orphan"
    )


class Location(Base):
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    type = Column(Enum(LocationType), nullable=False, default=LocationType.internal)
    # Optional grouping by warehouse
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True, index=True)

    warehouse = relationship("Warehouse", back_populates="locations")

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
    # Type of operation: receipt, delivery, internal transfer, adjustment
    operation_type = Column(Enum(OperationType), nullable=False, default=OperationType.internal)
    # Optional partner (supplier/customer)
    partner_id = Column(Integer, ForeignKey("partners.id"), nullable=True, index=True)
    created_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
    scheduled_date = Column(DateTime, nullable=True)

    source_location = relationship("Location", foreign_keys=[source_loc_id])
    dest_location = relationship("Location", foreign_keys=[dest_loc_id])
    created_by = relationship("User", foreign_keys=[created_by_id])

    lines = relationship("StockOperationLine", back_populates="operation", cascade="all, delete-orphan")
    moves = relationship("StockMove", back_populates="reference_operation")


class Partner(Base):
    __tablename__ = "partners"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    # partner type: vendor/supplier or customer
    partner_type = Column(Enum(PartnerType), nullable=False)
    contact = Column(String(255), nullable=True)


class Warehouse(Base):
    __tablename__ = "warehouses"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    address = Column(String(512), nullable=True)

    locations = relationship("Location", back_populates="warehouse")


class StockQuant(Base):
    __tablename__ = "stockquants"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False, index=True)
    quantity = Column(Numeric(14, 4), nullable=False, default=0)
    reserved_qty = Column(Numeric(14, 4), nullable=False, default=0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("product_id", "location_id", name="uq_stockquant_product_location"),
        CheckConstraint("quantity >= 0", name="ck_stockquant_quantity_nonnegative"),
    )

    product = relationship("Product")
    location = relationship("Location")





class StockLedger(Base):
    __tablename__ = "stockledger"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=True, index=True)
    change_qty = Column(Numeric(14, 4), nullable=False)
    resulting_qty = Column(Numeric(14, 4), nullable=False)
    move_id = Column(Integer, ForeignKey("stockmoves.id"), nullable=True, index=True)
    operation_id = Column(Integer, ForeignKey("stockoperations.id"), nullable=True, index=True)
    performed_by_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    reason = Column(String(255), nullable=True)
    date = Column(DateTime, default=datetime.utcnow, nullable=False)

    product = relationship("Product")
    location = relationship("Location")
    performed_by = relationship("User", foreign_keys=[performed_by_id])


class ReorderRule(Base):
    __tablename__ = "reorder_rules"

    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False, index=True)
    warehouse_id = Column(Integer, ForeignKey("warehouses.id"), nullable=True, index=True)
    min_qty = Column(Numeric(14, 4), nullable=False, default=0)
    max_qty = Column(Numeric(14, 4), nullable=True)
    reorder_qty = Column(Numeric(14, 4), nullable=True)

    product = relationship("Product")
    warehouse = relationship("Warehouse")


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
