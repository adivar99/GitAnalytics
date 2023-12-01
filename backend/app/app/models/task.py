from typing import Optional
from datetime import datetime, timedelta
from pydantic import Field, BaseModel

from app.models.enums import TaskType, TaskStatus

class TaskBase(BaseModel):
    id: int = Field(..., title="Id of Task", example=1)
    type: TaskType = Field(..., title="Type of Task", example=TaskType.STYLE)
    created: Optional[datetime] = Field(None, title="Timestamp of task creation", example=datetime.now()-timedelta(minutes=5))
    status: TaskStatus = Field(TaskStatus.NOT_STARTED, title="Status of Task", example=TaskStatus.RUNNING)
    updated: Optional[datetime] = Field(None, title="Last updated timestamp", example=datetime.now())
    project_id: int = Field(..., title="Project of Task", example=1)

class TaskCreate(TaskBase):
    type: TaskType
    created: datetime


class TaskUpdate(TaskBase):
    status: TaskStatus
    updated: datetime

class Task(TaskBase):
    pass