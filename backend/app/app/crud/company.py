from datetime import datetime
from sqlalchemy.orm import Session
from typing import Optional, List

from app.models import Company as model, CompanyCreate as model_create, CompanyUpdate as model_update
from app.db_models.company import Company as db_model

class CRUD_Company():
    def get_by_id(self, db_session: Session, id: int) -> model:
        """
        Return company by Id
        """
        return (
            db_session.query(db_model)
            .filter(db_model.id == id)
            .first()
        )

    def get_multi(self, db_session: Session, skip: int = 0, limit=100) -> List[model]:
        """
        Return multi companys
        """
        return (
            db_session
            .query(db_model)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_serial(self, db_session: Session, serial: str) -> List[model]:
        """
        Return company by license serial
        """
        return (
            db_session
            .query(db_model)
            .filter(db_model.serial == serial)
            .first()
        )
    
    def create(self, db_session: Session, obj_in: model_create) -> db_model:
        """
        Create company instance in db
        """
        jobj_in = obj_in.dict(exclude_unset=True)
        jobj_in["created"] = datetime.now()
        db_obj = db_model(**jobj_in)
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_obj)
        return db_obj
    
    def update(self, db_session: Session, id: int, obj_in: model_update):
        """
        update details of company based on input id
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
        Delete company based on input id
        """
        try:
            db_obj = db_session.query(db_model).get(id)
            db_session.delete(db_obj)
            db_session.commit()
            return True
        except Exception as e:
            print("Not deleted. Error raised: "+str(e))
            return False

crud_company = CRUD_Company()