from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.schemas.enums import UserType
from app.utils.utils import get_uuid_int

class User(Base):
    id = Column(Integer, primary_key=True, default=lambda: get_uuid_int())
    name = Column(String)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    user_type = Column(Enum(UserType, native_enum=False, create_constraint=False))
    is_active = Column(Boolean, default=True)