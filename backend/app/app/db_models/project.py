from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Project(Base):
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    uuid = Column(String)
    company_id = Column(Integer, ForeignKey("company.id"))
    company = relationship("Company", back_populates="project")
    user_proj = relationship("UProj", back_populates="project")
    # task = relationship("Task", back_populates="project")