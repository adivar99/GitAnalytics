from sqlalchemy.orm import Session
from typing import Optional, List

from app import models, crud
from app.models.enums import ProjectAccess
from app.models import Project as model, ProjectCreate as model_create, ProjectUpdate as model_update
from app.db_models.project import Project as db_model
from app.db_models.uproj import UProj

class CRUD_Project():
    def get_by_id(self, db_session: Session, id: int) -> model:
        """
        Return project by Id
        """
        return (
            db_session.query(db_model)
            .filter(db_model.id == id)
            .first()
        )

    def get_multi(self, db_session: Session, skip: int = 0, limit=100) -> List[model]:
        """
        Return multi projects
        """
        return (
            db_session
            .query(db_model)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_user(self, db_session: Session, user_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .join(db_model.user_proj)
            .filter(UProj.user_id == user_id)
            .all()
        )
    
    def get_by_company(self, db_session: Session, company_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.company_id == company_id)
            .all()
        )
    
    def create(self, db_session: Session, obj_in: model_create) -> db_model:
        """
        Create project instance in db
        """
        db_obj = db_model(**obj_in.dict(exclude_unset=True))
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_obj)
        return db_obj
    
    def update(self, db_session: Session, id: int, obj_in: model_update):
        """
        update details of project based on input id
        """
        db_obj = self.get_by_id(db_session, id)
        if db_obj is None:
            return None
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(db_obj, field, getattr(obj_in, field))
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_model)
        return db_obj


    def delete(self, db_session: Session, id: int):
        """
        Delete project based on input id
        """
        try:
            db_obj = db_session.query(db_model).get(id)
            db_session.delete(db_obj)
            db_session.commit()
            return True
        except Exception as e:
            print("Not deleted. Error raised: "+str(e))
            return False

crud_project = CRUD_Project()