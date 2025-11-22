"""Shared enum types for StockMaster used by models and schemas.

Keeping enums in a small `types` module avoids circular imports and keeps
API/DB layers synchronized without importing models into schemas.
"""
from enum import Enum


class LocationType(str, Enum):
    vendor = "vendor"
    customer = "customer"
    internal = "internal"
    inventory_loss = "inventory_loss"


class OperationStatus(str, Enum):
    draft = "draft"
    waiting = "waiting"
    ready = "ready"
    done = "done"


class OperationType(str, Enum):
    receipt = "receipt"
    delivery = "delivery"
    internal = "internal"
    adjustment = "adjustment"


class PartnerType(str, Enum):
    vendor = "vendor"
    customer = "customer"
