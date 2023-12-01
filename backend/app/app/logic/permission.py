from typing import List

from app import crud, models
from app.models.enums import Permissions, ProjectAccess, UserType


class PermissionHandler:
    def has_permission(
            self,
            db_session,
            user: models.User,
            proj_id: int,
            perm: Permissions,
        ) -> bool:
        uproj = crud.crud_uproj.get_by_user_n_proj(
            db_session, user_id=user.id, proj_id=proj_id)
        if user.is_admin:
            return True
        return perm in self.get_permissions(uproj.access)

    def get_permissions(self, access_type: ProjectAccess):
        perm_methods = {
            ProjectAccess.MANAGER: self.get_manager_permissions,
            ProjectAccess.READ_WRITE: self.get_read_write_permissions,
            ProjectAccess.GUEST: self.get_guest_permissions
        }
        return perm_methods[access_type]()

    def get_guest_permissions(self) -> List[Permissions]:
        return [
            Permissions.ACCESS_TASK,
            Permissions.ACCESS_PROJECT,
            Permissions.ACCESS_COMPANY,
        ]

    def get_read_write_permissions(self) -> List[Permissions]:
        sub_perms = self.get_guest_permissions()
        perms = [
            Permissions.CREATE_TASK,
            Permissions.UPDATE_TASK,
            Permissions.UPDATE_PROJECT,
        ]
        return sub_perms + perms

    def get_manager_permissions(self) -> List[Permissions]:
        sub_perms = self.get_read_write_permissions()
        perms = [
            Permissions.DELETE_TASK,
            Permissions.DELETE_PROJECT,
            Permissions.UPDATE_COMPANY,
            Permissions.ACCESS_USERS,
            Permissions.CREATE_USERS,
            Permissions.UPDATE_USERS,
            Permissions.DELETE_USERS
        ]
        return sub_perms + perms


permission_handler = PermissionHandler()
