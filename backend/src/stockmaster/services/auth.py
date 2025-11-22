"""Authentication services: password hashing, token creation, user helpers."""
from datetime import datetime, timedelta
from typing import Optional
import secrets
import smtplib
import os

from jose import JWTError, jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from .. import models, schemas
from ..core import config

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify a plaintext password against a stored hash using passlib.

    Uses Argon2 via passlib; no manual truncation is required for Argon2.
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """Hash a plaintext password using Argon2 (passlib CryptContext)."""
    return pwd_context.hash(password)


def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()


def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    hashed = get_password_hash(user_in.password)
    user = models.User(email=user_in.email, password_hash=hashed, full_name=user_in.full_name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, email: str, password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    if not verify_password(password, user.password_hash):
        return None
    return user


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + config.ACCESS_TOKEN_EXPIRE
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, config.SECRET_KEY, algorithm=config.ALGORITHM)
    return encoded_jwt


def get_current_user_from_token(db: Session, token: str) -> models.User:
    credentials_exception = Exception("Could not validate credentials")
    try:
        payload = jwt.decode(token, config.SECRET_KEY, algorithms=[config.ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception
    user = get_user_by_email(db, email=email)
    if user is None:
        raise credentials_exception
    return user


# Simple in-memory OTP store: {email: {otp: str, expires_at: datetime}}
# NOTE: this is intentionally simple for the demo. For production use a
# persistent store (Redis, DB table) so OTPs survive restarts and are rate-limited.
_otp_store: dict = {}
OTP_EXPIRY_MINUTES = int(os.getenv("PWD_RESET_OTP_EXPIRE_MINUTES", "10"))


def _send_email(to_email: str, subject: str, body: str) -> None:
    """Try to send mail via SMTP if configured, otherwise print to console.

    Environment variables (optional): SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
    """
    host = os.getenv("SMTP_HOST")
    port = int(os.getenv("SMTP_PORT", "0") or 0)
    user = os.getenv("SMTP_USER")
    password = os.getenv("SMTP_PASS")

    if host and port:
        try:
            server = smtplib.SMTP(host, port, timeout=10)
            server.starttls()
            if user and password:
                server.login(user, password)
            msg = f"Subject: {subject}\n\n{body}"
            server.sendmail(user or f"noreply@{host}", [to_email], msg)
            server.quit()
            return
        except Exception:
            # swallow and fallback to console printing
            pass

    # Fallback: log to stdout (visible in uvicorn logs)
    print(f"--- Password reset email to: {to_email} ---")
    print("Subject:", subject)
    print(body)
    print("--- end email ---")


def generate_and_send_reset_otp(db: Session, email: str) -> bool:
    """Generate a numeric 6-digit OTP, store it in memory and send to email.

    Returns True if user exists and OTP was generated/sent, False otherwise.
    """
    user = get_user_by_email(db, email)
    if not user:
        return False
    # 6-digit numeric
    otp = f"{secrets.randbelow(10**6):06d}"
    expires_at = datetime.utcnow() + timedelta(minutes=OTP_EXPIRY_MINUTES)
    _otp_store[email] = {"otp": otp, "expires_at": expires_at}

    subject = "Your StockMaster password reset code"
    body = (
        f"Use the following one-time code to reset your password: {otp}\n"
        f"This code expires in {OTP_EXPIRY_MINUTES} minutes."
    )
    _send_email(email, subject, body)
    return True


def verify_password_reset_otp(email: str, otp: str) -> bool:
    info = _otp_store.get(email)
    if not info:
        return False
    if info.get("otp") != otp:
        return False
    if datetime.utcnow() > info.get("expires_at"):
        # expired, clear
        _otp_store.pop(email, None)
        return False
    return True


def clear_password_reset_otp(email: str) -> None:
    _otp_store.pop(email, None)


def reset_password(db: Session, email: str, new_password: str) -> Optional[models.User]:
    user = get_user_by_email(db, email)
    if not user:
        return None
    hashed = get_password_hash(new_password)
    user.password_hash = hashed
    db.add(user)
    db.commit()
    db.refresh(user)
    # clear any OTP associated
    clear_password_reset_otp(email)
    return user
