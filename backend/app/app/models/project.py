from typing import Optional
from pydantic import Field, BaseModel

from app.models.enums import ProjectStatus
from app.utils.utils import get_uuid_int


class ProjectBase(BaseModel):
    title: str = Field(..., title="Title of Project", example="First Project")
    description: Optional[str] = Field(None, title="Description of Project", example="Example description for the first Project")
    status: ProjectStatus = Field(ProjectStatus.PENDING, title="Status of Project", example=ProjectStatus.PENDING)
    company_id: int = Field(..., title="Company of Project", example=1)

class ProjectCreate(ProjectBase):
    pass


class ProjectUpdate(ProjectBase):
    pass

class Project(ProjectBase):
    pass

class ProjectInDB(ProjectBase):
    id: int = Field(..., title="Id of Project", example=get_uuid_int())
    pass