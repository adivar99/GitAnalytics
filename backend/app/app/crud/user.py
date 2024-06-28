from app.core.security import get_password_hash, verify_password
from sqlalchemy.orm import Session
from typing import Optional, List

from fastapi import HTTPException

from app.models import User as model, UserCreate as model_create, UserUpdate as model_update, UserLogin
from app.db_models.user import Users as db_model
from app.db_models.uproj import UProj
from app.db_models.company import Company
from app.models.enums import UserType
from app.utils.utils import get_randID

class CRUDUser():
    def get_by_id(self, db_session: Session, id: int) -> model:
        """
        Return User by Id
        """
        return (
            db_session.query(db_model)
            .filter(db_model.id == id)
            .first()
        )

    def get_multi(self, db_session: Session, skip: int = 0, limit=100) -> List[model]:
        """
        Return all users
        """
        return (
            db_session
            .query(db_model)
            .offset(skip)
            .limit(limit)
            .all()
        )

    def get_by_username(self, db_session: Session, username: str) -> Optional[model]:
        """
        Return user by user name
        """
        return (
            db_session.query(db_model)
            .filter(db_model.username == username)
            .first()
        )

    def get_by_email(self, db_session: Session, email: str):
        return (
            db_session.query(db_model)
            .filter(db_model.email == email)
            .first()
        )

    def get_by_company(self, db_session: Session, company_id: int) -> List[Optional[model]]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.company_id == company_id)
            .all()
        )

    def get_ids(self, db_session: Session) -> List[int]:
        users = self.get_all(db_session)

        li = []
        for user in users:
            li.append(user.id)
        
        return li
    
    def get_by_project(self, db_session: Session, project_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .join(db_model.user_proj)
            .filter(UProj.proj_id == project_id)
            .all()
        )
    
    def get_by_company(self, db_session: Session, company_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .join(db_model.company)
            .filter(Company.id == company_id)
            .all()
        )

    def check_user(self, db_session: Session, login: UserLogin) -> bool:
        if login.username is not None:
            user = self.get_by_username(db_session, login.username)
        elif login.email is not None:
            user = self.get_by_email(db_session, email=login.email)
        
        if not user:
            return None
        if not verify_password(login.password, user.password):
            return None
        return user

    def is_superuser(self, db_obj: model) -> bool:
        return db_obj.user_type == UserType.SUPER
    
    def is_demouser(self, db_obj: model) -> bool:
        return db_obj.user_type == UserType.DEMO
    
    def is_active(self, db_obj: model) -> bool:
        return db_obj.is_active


    def create(self, db_session: Session, obj_in: model_create) -> db_model:
        """
        Create user instance in db
        """
        json_data = obj_in.dict(exclude_unset=True)
        if self.get_by_username(db_session, username=obj_in.username):
            raise HTTPException("Username already exists")
        json_data["password"] = get_password_hash(obj_in.password)
        db_obj = db_model(**json_data)
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_obj)
        return db_obj


    def update(self, db_session: Session, id: int, obj_in: model_update):
        """
        update details of user based on input id
        """
        user = self.get_by_id(db_session, id)
        if user is None:
            return None
        update_data = obj_in.dict(exclude_unset=True)
        if "password" in update_data.keys():
            update_data["password"] = get_password_hash(obj_in.password)
        for field in update_data:
            setattr(user, field, getattr(obj_in, field))
        db_session.add(user)
        db_session.commit()
        # db_session.refresh(db_model)
        return user


    def delete(self, db_session: Session, id: int):
        """
        Delete user based on input id
        """
        if id not in self.get_ids(db_session):
            print("user doesn't exist")
            return (False, "User does not exist")
        try:
            user = db_session.query(db_model).get(id)
            db_session.delete(user)
            db_session.commit()
            print("deleted")
            return (True, "Success")
        except Exception as e:
            print("Not deleted. Error raised: "+str(e))
            return (False, str(e))

crud_user = CRUDUser()