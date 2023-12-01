from sqlalchemy.orm import Session
from typing import Optional, List
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app.api import deps
from app import crud, models
from app.core.config import settings
from app.models.enums import Permissions
from app.utils.verify_user import verify_user
from app.logic.permission import permission_handler
from app.models.user import User as model, UserUI as modelUI, UserCreate, UserUpdate

router = APIRouter()


@router.get(
    "/",
    response_model=List[modelUI]
)
def get_all_users(
    db_session: Session = Depends(deps.get_db),
    skip: int = 0,
    limit: int = 100,
    current_user: model = Depends(deps.get_current_active_superuser)
) -> modelUI:
    _users = crud.crud_user.get_multi(db_session, skip=skip, limit=limit)
    print(_users.json())
    return _users


# @router.get(
#     "/{id}",
#     response_model=model
# )
# def get_user(
#     id: int,
#     db_session: Session = Depends(deps.get_db),
#     current_user: model = Depends(deps.get_current_active_user)
# ):
#     _user = crud.crud_user.get_by_id(db_session, id)
#     return _user


@router.get("/me", response_model=modelUI)
def get_current_user(current_user: model = Depends(deps.get_current_user)):
    print(current_user.__dict__)
    return current_user


@router.put(
    "/me",
    response_model=modelUI
)
def update_current_user(
    user_in: UserUpdate,
    db_session: Session = Depends(deps.get_db),
    current_user: model = Depends(deps.get_current_active_user)
):
    return crud.crud_user.update(db_session, id=current_user.id, obj_in=user_in)


@router.post("/", response_model=modelUI)
def create_user(
    *,
    db: Session = Depends(deps.get_db),
    user_in: UserCreate,
    projects: List[models.UProjCreate],
    current_user=Depends(deps.get_current_active_superuser),
):
    """
    Create new user.
    """
    # check if user has admin access for project.
    projects = [project for project in projects if verify_user.user_is_admin(
        db_session=db, user=current_user, proj_id=project.project_id)]
    if len(projects) == 0 or not crud.crud_user.is_superuser(current_user):
        raise HTTPException(
            detail="No ADMIN access to Projects", status_code=401)
    user = crud.user.get_by_email(db, email=user_in.email)
    if user:
        raise HTTPException(
            status_code=400,
            detail="The user with this username already exists in the system.",
        )
    user = crud.crud_user.create(db, obj_in=user_in)
    for project in projects:
        models.UProjCreate(
            user_id=user.id, proj_id=project.project_id, access=project.access)
    return user


@router.put("/{user_id}", response_model=modelUI)
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

@router.get('/permissions', response_model=List[Permissions])
async def get_user_permissions(
    proj_id: int,
    *,
    db: Session = Depends(deps.get_db),
    current_user: model = Depends(deps.get_current_active_user)
):
    up = crud.crud_uproj.get_by_user_n_proj(db, current_user.id, proj_id)
    return permission_handler.get_permissions(up.access)