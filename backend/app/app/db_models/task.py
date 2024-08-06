from sqlalchemy import Column, Integer, String, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import TaskType, TaskStatus
from app.utils.utils import get_uuid_int

class Task(Base):
    id = Column(Integer, primary_key=True)
    created = Column(DateTime(timezone=False), index=True)
    type = Column(Enum(TaskType, native_enum=False, create_constraint=False))
    status = Column(Enum(TaskStatus, native_enum=False, create_constraint=False))
    updated = Column(DateTime(timezone=False))
    project_id = Column(Integer, ForeignKey("project.id"))
    # project = relationship("Project", back_populates="task")