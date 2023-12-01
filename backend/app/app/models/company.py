from typing import Optional
from datetime import datetime
from pydantic import Field, BaseModel
from pydantic.networks import EmailStr


class CompanyBase(BaseModel):
    id: Optional[str] = None
    name: str = Field(..., title="Name of companu", example="First Organization")

class CompanyCreate(CompanyBase):
    name: str
    serial: str

class CompanyInDB(CompanyBase):
    created: datetime = Field(datetime.now(), title="Timestamp of creation", example=datetime.now())
    serial: str = Field(..., title="Serial for Company", examples="ING00001")

class CompanyUpdate(CompanyBase):
    name: str

class Company(CompanyBase):
    pass