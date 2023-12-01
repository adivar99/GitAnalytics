import logging
from datetime import datetime
from sqlalchemy.orm import Session

from app import crud, models
from app.models.enums import UserType
from app.core.config import settings

logger = logging.getLogger(__name__)

class InitDB:
    def __init__(self, db_session: Session) -> None:

        self.initialise_superuser(db_session)

    def initialise_superuser(self, db_session: Session):
        suser = crud.crud_user.get_by_email(db_session, settings.SUPERUSER_EMAIL)
        if suser:
            return
        scompany=crud.crud_company.get_by_serial(db_session, serial="SUPERUSER")
        if scompany:
            return
        logger.info("Creating company for super user")
        scompany_in = models.CompanyCreate(name=settings.SUPERUSER_COMPANY, serial="SUPERUSER")
        scompany = crud.crud_company.create(db_session, obj_in=scompany_in)
        
        logger.info(f"Creating superuser {settings.SUPERUSER_EMAIL}")
        suser_in = models.UserCreate(
            name=settings.SUPERUSER_EMAIL.split("@")[0],
            username=settings.SUPERUSER_EMAIL.split("@")[0],
            email=settings.SUPERUSER_EMAIL,
            password=settings.SUPERUSER_PASSWORD,
            is_admin=True,
            user_type=UserType.SUPER,
            company_id=scompany.id
        )

        logger.info(f"SUPERUSER model: "+str(suser_in.__dict__))
        suser = crud.crud_user.create(db_session, obj_in=suser_in)


