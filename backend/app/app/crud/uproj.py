from sqlalchemy.orm import Session
from typing import Optional, List

from app.models import UProj as model, UProjCreate as model_create, UProjUpdate as model_update
from app.db_models.uproj import UProj as db_model

class CRUD_UProj():
    def get_by_id(self, db_session: Session, id: int) -> model:
        """
        Return uproj by Id
        """
        return (
            db_session.query(db_model)
            .filter(db_model.id == id)
            .first()
        )

    def get_multi(self, db_session: Session, skip: int = 0, limit=100) -> List[model]:
        """
        Return multi uprojs
        """
        return (
            db_session
            .query(db_model)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_by_proj(self, db_session: Session, proj_id: int) -> List[model]:
        """
        Get all uproj by proj
        """
        return (
            db_session
            .query(db_model)
            .filter(db_model.proj_id == proj_id)
            .all()
        )
    
    def get_by_user(self, db_session: Session, user_id: int) -> List[model]:
        """
        Get all uproj by user
        """
        return (
            db_session
            .query(db_model)
            .filter(db_model.user_id == user_id)
            .all()
        )
    
    def get_by_user_n_proj(self, db_session: Session, user_id: int, proj_id: int) -> Optional[model]:
        """
        Return instance of User's access to Project
        """
        return (
            db_session
            .query(db_model)
            .filter(db_model.user_id == user_id)
            .filter(db_model.proj_id == proj_id)
            .first()
        )
    
    def create(self, db_session: Session, obj_in: model_create) -> db_model:
        """
        Create uproj instance in db
        """
        db_obj = db_model(**obj_in.dict(exclude_unset=True))
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_obj)
        return db_obj
    
    def update(self, db_session: Session, id: int, obj_in: model_update):
        """
        update details of uproj based on input id
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
        Delete uproj based on input id
        """
        try:
            db_obj = db_session.query(db_model).get(id)
            db_session.delete(db_obj)
            db_session.commit()
            return True
        except Exception as e:
            print("Not deleted. Error raised: "+str(e))
            return False
        
crud_uproj = CRUD_UProj()