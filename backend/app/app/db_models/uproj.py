from sqlalchemy import Column, Integer, DateTime, Enum, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import ProjectAccess

class UProj(Base):
    id = Column(Integer, primary_key=True)
    joined = Column(DateTime(timezone=False), index=True)
    proj_id = Column(Integer, ForeignKey("project.id"))
    project = relationship("Project", back_populates="user_proj")
    user_id = Column(Integer, ForeignKey("user.id"))
    # user = relationship("User", back_populates="user_proj")
    access = Column(Enum(ProjectAccess, native_enum=False, create_constraint=False))