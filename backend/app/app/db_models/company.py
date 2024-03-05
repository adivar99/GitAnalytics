from sqlalchemy import Column, Integer, String, DateTime, Enum, Float
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.utils.utils import get_uuid_int

class Company(Base):
    id = Column(Integer, primary_key=True, default=lambda: get_uuid_int())
    name = Column(String)
    created = Column(DateTime)
    serial = Column(String)
    user = relationship("User", cascade="all, delete-orphan", back_populates="company")
    project = relationship("Project", cascade="all, delete-orphan", back_populates="company")