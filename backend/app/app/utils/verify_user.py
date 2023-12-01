from pydantic import BaseModel
from sqlalchemy.orm import Session

from app import models, crud
from app.models.enums import ProjectAccess, Permissions
from app.logic.permission import permission_handler


class VerifyUser(BaseModel):
    def user_is_manager(self, db_session: Session, user: models.User, proj_id: int):

        uproj = crud.crud_uproj.get_by_user_n_proj(
            db_session, user_id=user.id, proj_id=proj_id
        )
        return uproj and uproj.access == ProjectAccess.MANAGER

    def user_is_RW(self, db_session: Session, user: models.User, proj_id: int):
        uproj = crud.crud_uproj.get_by_user_n_proj(
            db_session, user_id=user.id, proj_id=proj_id)
        return uproj and uproj.access == ProjectAccess.READ_WRITE

    def user_is_guest(self, db_session: Session, user: models.User, proj_id: int):
        uproj = crud.crud_uproj.get_by_user_n_proj(
            db_session, user_id=user.id, proj_id=proj_id)
        return uproj and uproj.access == ProjectAccess.GUEST
    
    def can_access_task(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.ACCESS_TASK)
    
    def can_create_task(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.CREATE_TASK)
    
    def can_delete_task(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.DELETE_TASK)
    
    def can_access_project(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.ACCESS_PROJECT)
    
    def can_create_project(self, db_session: Session, user: models.User, proj_id: int):
        return permission_handler.has_permission(db_session, user, proj_id, perm=Permissions.CREATE_PROJECT)
    
    def can_update_project(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.UPDATE_PROJECT)
    
    def can_access_user(self, db_session, user: models.User, proj_id=int):
        return permission_handler.has_permission(db_session, user, proj_id, Permissions.ACCESS_USERS)
    

verify_user = VerifyUser()