"""Central configuration for StockMaster.

Loads environment variables and exposes app-wide settings.
"""
from dotenv import load_dotenv
import os
from datetime import timedelta

load_dotenv()

SECRET_KEY = os.getenv("STOCKMASTER_SECRET", "dev-secret-for-hackathon")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60"))

# Database url helper
DATABASE_URL = os.getenv("DATABASE_URL")

# Helper values
ACCESS_TOKEN_EXPIRE = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
