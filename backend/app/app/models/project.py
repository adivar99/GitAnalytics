from typing import Optional
from datetime import datetime
from pydantic import Field, BaseModel, PastDatetime

from app.models.enums import ProjectStatus, ProjectAccess
from app.utils.utils import get_uuid_int, get_uuid


class ProjectBase(BaseModel):
    title: str = Field(..., title="Title of Project", example="First Project")
    description: Optional[str] = Field(None, title="Description of Project", example="Example description for the first Project")
    status: ProjectStatus = Field(ProjectStatus.PENDING, title="Status of Project", example=ProjectStatus.PENDING)
    rating: float = Field(0, title="Rating of the project", example=4.8)
    company_id: int = Field(..., title="Company of Project", example=1)
    uuid: Optional[str] = Field(None, title="UUID to refer to the project", examples=get_uuid())
    lastScanned: Optional[PastDatetime] = Field(None, title="Last scan time in the project", example=datetime.now())

class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass

class Project(ProjectBase):
    id: int
    pass

class ProjectInDB(ProjectBase):
    id: int = Field(..., title="Id of Project", example=get_uuid_int())
    pass

class ProjectResponse(BaseModel):
    id: int
    title: str
    description: str
    users: int
    rating: float
    access: ProjectAccess
    lastScanned: Optional[datetime]