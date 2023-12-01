from typing import Optional
from pydantic import Field, BaseModel
from pydantic.networks import EmailStr
from datetime import datetime

from app.models.enums import ProjectAccess

class UProjBase(BaseModel):
    joined: datetime = Field(datetime.now())
    user_id: int = Field(..., title="Id of user", example=1)
    proj_id: int = Field(..., title="Id of proj", example=1)
    access: ProjectAccess = Field(ProjectAccess.GUEST, title="Role of user in project", example=ProjectAccess.MANAGER)

class UProjCreate(UProjBase):
    pass

class UProjUpdate(UProjBase):
    pass

class UProj(UProjBase):
    pass

class UProjInDB(UProjBase):
    id: int = Field(..., title="Id of user", example=1)
