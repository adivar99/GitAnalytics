import logging
from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session
from fastapi import HTTPException, Depends, APIRouter, status, Request

from app.api import deps


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/master_info")
def get_my_projects(
    data=dict,
    db_session: Session = Depends(deps.get_db),
):
    print(data)