import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app import crud, models
from app.api import deps
from app.models import Project, User
from app.models.enums import ProjectAccess
from app.utils.verify_user import verify_user

router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/me", response_model=List[Project])
def get_my_projects(
    db_session: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user)
):
    proj = crud.crud_project.get_by_user(db_session, current_user.id)
    print(proj)
    return proj

@router.post("/", response_model=Project)
def create_project(
    proj_in: models.ProjectCreate,
    db_session: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    if not current_user.is_admin:
        raise HTTPException(status_code=400, detail="No Permission to create Project")
    
    if not crud.crud_company.get_by_id(db_session, proj_in.company_id):
        raise HTTPException(status_code=400, detail="Company not Found")
    
    proj = crud.crud_project.create(db_session, obj_in=proj_in)
    logger.info(proj)

    # Add entry to user_proj
    obj_in = models.UProjCreate(
        joined=datetime.now(),
        user_id=current_user.id,
        proj_id=proj.id,
        access=ProjectAccess.MANAGER
    )
    _ = crud.crud_uproj.create(db_session, obj_in)
    return proj


@router.put("/project/{proj_id}", response_model=Project)
def update_project(
    proj_in: models.ProjectUpdate,
    proj_id: int,
    db_session: Session = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_active_user),
):
    if not crud.crud_company.get_by_id(db_session, proj_in.company_id):
        raise HTTPException(status_code=400, detail="Company not Found")
    
    if not crud.crud_project.get_by_id(db_session, id=proj_id):
        raise HTTPException(status_code=400, detail="Project Not Found")
        
    proj = crud.crud_project.update(db_session, id=proj_id, obj_in=proj_in)
    return proj

