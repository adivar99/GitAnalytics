from typing import Optional
from pydantic import Field, BaseModel, EmailStr
# from pydantic.networks import EmailStr

from app.models.enums import UserType

class UserBase(BaseModel):
    id: int = None
    name: str = Field(None, title="Name of User", example="John")
    username: str = Field(None, title="UserName of User", example="jdoe99")
    email: EmailStr = Field(..., title="Email of User", example="john.doe@example.com")
    password: str = Field(..., title="password of user", example="aweoweofiewnf")
    is_active: bool = Field(True, title="Is user active", example=True)
    is_admin: bool = Field(False, title="Is user admin of company", example=False)
    user_type: UserType = Field(UserType.USER, title="Type of user", example=UserType.USER)
    company_id: int = Field(..., title="Company Id of User", example=1)


class UserCreate(UserBase):
    pass


class UserUpdate(UserBase):
    pass

class User(UserBase):
    pass

class UserLogin:
    username: Optional[str]
    email: Optional[str]
    password: str

class UserUI(BaseModel):
    name: str = Field(None, title="Name of User", example="John")
    username: str = Field(None, title="UserName of User", example="jdoe99")
    email: EmailStr = Field(..., title="Email of User", example="john.doe@example.com")
    is_active: bool = Field(True, title="Is user active", example=True)
    is_admin: bool = Field(False, title="Is user admin of company", example=False)
    user_type: UserType = Field(UserType.USER, title="Type of user", example=UserType.USER)
    company_id: int

class RegisterForm(BaseModel):
    name: str
    username: str
    email: EmailStr
    password: str