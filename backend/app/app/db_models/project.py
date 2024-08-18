from sqlalchemy import Column, Integer, String, ForeignKey, Float, DateTime
from sqlalchemy.orm import relationship

from app.db.base_class import Base

class Project(Base):
    id = Column(Integer, primary_key=True)
    title = Column(String)
    description = Column(String)
    uuid = Column(String)
    rating = Column(Float, default=0)
    lastScanned = Column(DateTime)
    company_id = Column(Integer, ForeignKey("company.id"))
    company = relationship("Company", back_populates="project")
    user_proj = relationship("UProj", back_populates="project")
    # task = relationship("Task", back_populates="project")