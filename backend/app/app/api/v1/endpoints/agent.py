import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app.api import deps
from app import models


router = APIRouter()
logger = logging.getLogger(__name__)

@router.post("/get-token")
def gettoken(
    token_in: models.TokenIn,
    db: Session = Depends(deps.get_db)
):
    logger.info(f"Agent Auth request with Proj: {token_in.proj}")
    
@router.post("/master_info")
def get_my_projects(
    data: dict,
    db_session: Session = Depends(deps.get_db),
):
    print(data)