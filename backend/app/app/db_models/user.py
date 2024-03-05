from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import UserType
from app.utils.utils import get_uuid_int

class User(Base):
    id = Column(Integer, primary_key=True, default=lambda: get_uuid_int())
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    user_type = Column(Enum(UserType, native_enum=False, create_constraint=False))
    is_active = Column(Boolean, default=True)
    is_admin = Column(Boolean, default=False)
    company_id = Column(Integer, ForeignKey("company.id"))
    company = relationship("Company", back_populates="user")
    user_proj = relationship("UProj", back_populates="User")