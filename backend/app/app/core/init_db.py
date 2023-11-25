import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app import crud, schemas
from app.schemas.enums import UserType
from app.core.config import settings

logger = logging.getLogger(__name__)

class InitDB:
    def __init__(self, db_session: Session) -> None:

        self.suser = None
        self.initialise_superuser(db_session)

    def initialise_superuser(self, db_session: Session):
        suser = crud.crud_user.get_by_email(db_session, settings.SUPERUSER_EMAIL)
        if suser:
            return
        logger.info(f"Creating superuser {settings.SUPERUSER_EMAIL}")
        suser_in = schemas.UserCreate(
            name=settings.SUPERUSER_EMAIL.split("@")[0],
            username=settings.SUPERUSER_EMAIL.split("@")[0],
            email=settings.SUPERUSER_EMAIL,
            password=settings.SUPERUSER_PASSWORD,
            user_type=UserType.SUPER,
        )
        self.suser = crud.crud_user.create(db_session, obj_in=suser_in)


