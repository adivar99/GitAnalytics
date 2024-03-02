from typing import Generator, Optional

from fastapi import Depends, HTTPException, Request, status
from fastapi.openapi.models import OAuthFlows as OAuthFlowsModel
from fastapi.security import OAuth2, SecurityScopes
from fastapi.security.utils import get_authorization_scheme_param
from jose import JWTError, jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from app import crud, models
from app.core import security
from app.core.config import settings


class OAuth2PasswordBearerCookie(OAuth2):
    def __init__(
        self,
        tokenUrl: str,
        scheme_name: str = None,
        scopes: dict = None,
        auto_error: bool = True,
    ):
        if not scopes:
            scopes = {}
        flows = OAuthFlowsModel(password={"tokenUrl": tokenUrl, "scopes": scopes})
        super().__init__(flows=flows, scheme_name=scheme_name, auto_error=auto_error)

    async def __call__(self, request: Request) -> Optional[str]:
        cookie_authorization: str = request.cookies.get("Authorization")
        cookie_scheme, cookie_param = get_authorization_scheme_param(cookie_authorization)
        authorization = False

        if cookie_scheme.lower() == "bearer":
            authorization = True
            scheme = cookie_scheme
            param = cookie_param

        if not authorization or scheme.lower() != "bearer":
            if self.auto_error:
                raise HTTPException(status_code=403, detail="Not authenticated")
            else:
                return None
        return param


# reusable_oauth2 = OAuth2PasswordBearerCookie(
#     tokenUrl=f"/login/access-token",
# )

reusable_oauth2 = OAuth2PasswordBearerCookie(
   tokenUrl=f"{settings.API_V1_STR}/login/access-token",
   scopes={
       "/api/v1/agent/": "Agent related APIs"
   }
)


def get_db() -> Generator:
    try:
        db = Session()
        yield db
    finally:
        db.close()


async def get_current_user(
    security_scopes: SecurityScopes,
    db: Session = Depends(get_db),
    token: str = Depends(reusable_oauth2),
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope="{security_scopes.scope_str}"'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value},
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = models.TokenPayload(scopes=token_scopes, sub=username)
    except (JWTError, ValidationError):
        raise credentials_exception
    user = crud.crud_user.get_by_id(db, id=token_data.sub)
    if user is None:
        raise credentials_exception
    # Mantis 0774845 - all other API endpoints must reject this token (token with scope)
    if token_scopes:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not enough permissions - 0",
            headers={"WWW-Authenticate": authenticate_value},
        )
    return user

async def get_scanner_user(
        security_scopes: SecurityScopes,
        db: Session = Depends(get_db),
        token: str = Depends(reusable_oauth2),
):
    if security_scopes.scopes:
        authenticate_value = f'Bearer scope={security_scopes.scope_str}'
    else:
        authenticate_value = "Bearer"

    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": authenticate_value}
    )
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_scopes = payload.get("scopes", [])
        token_data = models.TokenPayload(scopes=token_scopes, sub=username)
    except (JWTError, ValidationError):
        raise credentials_exception
    
    user = crud.crud_user.get(db, id=token_data.sub)
    if user is None:
        raise credentials_exception
    
    for scope in security_scopes.scopes:
        if scope not in token_data.scopes:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Not scanner enough permissions - 1"
            )
    return user

def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.crud_user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user


def get_current_active_nondemo_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.crud_user.is_active(current_user):
        raise HTTPException(status_code=400, detail="Inactive user")
    elif crud.crud_user.is_demouser(current_user):
        raise HTTPException(status_code=400, detail="Not enough privileges, demo user")
    return current_user


def get_current_active_superuser(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if not crud.crud_user.is_superuser(current_user):
        raise HTTPException(
            status_code=400, detail="The user doesn't have enough privileges"
        )
    return current_user