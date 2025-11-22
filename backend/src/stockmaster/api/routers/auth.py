"""Auth router: register and token endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ... import schemas
from ...deps import get_db
from ...services import auth as auth_service

router = APIRouter()


@router.post("/users/", response_model=schemas.UserOut)
def register(user_in: schemas.UserCreate, db: Session = Depends(get_db)):
    if auth_service.get_user_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")
    user = auth_service.create_user(db, user_in)
    return user


@router.post("/token", response_model=schemas.Token)
def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = auth_service.authenticate_user(db, form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = auth_service.create_access_token({"sub": user.email})
    return {"access_token": access_token, "token_type": "bearer"}



@router.post("/password-reset/request")
def request_password_reset(req: schemas.PasswordResetRequest, db: Session = Depends(get_db)):
    """Request a password reset OTP for an email.

    For security, this endpoint always returns 200 with a generic message.
    If the email exists, an OTP will be generated and sent to the address.
    """
    # generate_and_send_reset_otp returns False if user not found; we don't leak that.
    auth_service.generate_and_send_reset_otp(db, req.email)
    return {"detail": "If the email is registered, a reset code has been sent."}


@router.post("/password-reset/confirm", response_model=schemas.UserOut)
def confirm_password_reset(req: schemas.PasswordResetConfirm, db: Session = Depends(get_db)):
    """Verify OTP and set a new password for the given email."""
    if not auth_service.verify_password_reset_otp(req.email, req.otp):
        raise HTTPException(status_code=400, detail="Invalid or expired OTP")
    user = auth_service.reset_password(db, req.email, req.new_password)
    if not user:
        # This should be rare because OTP was valid, but handle edge cases
        raise HTTPException(status_code=400, detail="User not found")
    return user
