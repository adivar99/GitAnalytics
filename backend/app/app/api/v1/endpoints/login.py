import logging
from typing import Any
from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from fastapi.responses import JSONResponse, RedirectResponse
from sqlalchemy.orm import Session

from app import crud, schemas
from app.api import deps
from app.core import security
from app.core.config import settings


router = APIRouter()
logger = logging.getLogger(__name__)


@router.post("/access-token", response_model=schemas.Token)
def login_access_token(db: Session = Depends(deps.get_db),
                       form_data: OAuth2PasswordRequestForm = Depends()) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.crud_user.check_user(db, form_data)
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")
    elif not crud.crud_user.is_active(user):
        raise HTTPException(status_code=400, detail="Inactive user")
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(data={'sub': str(user.id)}, expires_delta=access_token_expires)
    response = JSONResponse(content={
            "access_token": access_token,
            "token_type": "bearer",
        },
        status_code=200)
    response.set_cookie(
        key="Authorization",
        value=f"Bearer {access_token}",
        httponly=True,
    )
    return response

@router.post("/logout", response_model=schemas.Token)
def login_logout(current_user: schemas.User = Depends(deps.get_current_active_user)) -> Any:
    """
    set access-token to expired date.
    """
    response = RedirectResponse(url="/", status_code=302)
    response.delete_cookie("Authorization")
    return response
