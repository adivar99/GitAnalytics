from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.utils.utils import get_uuid_int

class Company(Base):
    id = Column(Integer, primary_key=True)
    name = Column(String)
    created = Column(DateTime)
    serial = Column(String)
    users = relationship("Users", cascade="all, delete-orphan", back_populates="company")
    project = relationship("Project", cascade="all, delete-orphan", back_populates="company")