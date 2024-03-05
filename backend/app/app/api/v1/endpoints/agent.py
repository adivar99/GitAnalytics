import logging
from datetime import datetime, timedelta
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app.core.config import settings
from app.core import security
from app.api import deps
from app import models, crud


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/get-token", response_model=models.AgentResp)
def gettoken(
    token_in: models.AgentIn,
    db: Session = Depends(deps.get_db)
):
    logger.info(f"Agent Auth request with Proj: {token_in.proj}")

    if not (proj := crud.crud_project.get_by_uuid(db, uuid=token_in.proj)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project does not exist"
        )
    
    if not (uproj := crud.crud_uproj.get_first_by_proj(db, proj_id=proj.id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User for Project not found"
        )
    
    if not (user := crud.crud_user.get_by_id(db, id=uproj.user_id)):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User for Project not found"
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        {"sub": str(user.id), "scopes": ["/api/v1/agent"]},
        expires_delta=access_token_expires
    )
    agent_resp = models.AgentResp(
        access_token=access_token,
        token_type="Bearer",
        exp_after_secs=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )
    return agent_resp


@router.post("/master_info")
def get_my_projects(
    data: dict,
    db_session: Session = Depends(deps.get_db),
    scanner_user: models.User = Depends(deps.get_agent_user)
):
    print(data)