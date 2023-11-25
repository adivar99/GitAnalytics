from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app import crud, schemas
from app.api import deps
from app.schemas.user import User as model, UserCreate, UserLogin, UserUpdate

router = APIRouter()


@router.get(
    "/",
    response_model=List[model]
)
def get_all_users(
    db_session: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: model = Depends(deps.get_current_active_user)
):
    _users = crud.crud_user.get_multi(db_session, skip=skip, limit=limit)
    return _users


@router.get(
    "/{id}",
    response_model=model
)
def get_user(
    id: int,
    db_session: Session = Depends(deps.get_db),
    current_user: model = Depends(deps.get_current_active_user)
):
    _user = crud.crud_user.get_by_id(db_session, id)
    return _user


@router.get(
    "/me",
    response_model=List[model]
)
def get_current_user(current_user: model = Depends(deps.get_current_active_user)):
    return current_user


@router.put(
    "/me",
    response_model=List[model]
)
def update_current_user(
    user_in: UserUpdate,
    db_session: Session = Depends(deps.get_db),
    current_user: model = Depends(deps.get_current_active_user)
):
    return crud.crud_user.update(db_session, id=current_user.id, obj_in=user_in)


@router.post("/", response_model=model)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    current_user=Depends(deps.get_current_active_superuser),
):
    """
    Create new user.
    """
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud.crud_user.create(db, obj_in=user_in)
    return user


@router.put("/{user_id}", response_model=model)
def update_user(
    *,
    db: Session = Depends(deps.get_db),
    user_id: int,
    user_in: UserUpdate,
    current_user: model = Depends(deps.get_current_active_superuser),
):
    """
    Update a user.
    """
    user = crud.crud_user.update(db, id=user.id, obj_in=user_in)
    if not user:
        raise HTTPException(
            status_code=404,
            detail="The user with this username does not exist in the system",
        )
    return user
