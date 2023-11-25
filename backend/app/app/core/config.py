import os
from typing import List, Union
from pydantic import AnyHttpUrl, validator
from pydantic_settings import BaseSettings


class ConfigClass(BaseSettings):

    APP_TITLE: str = os.getenv("PROJECT_NAME", "AdiFashion")
    PROJECT_VERSION: str = os.getenv("PROJECT_VERSION", "1.0.0")
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = []

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    API_V1_STR: str = "/api/v1"
    SECRET_KEY: bytes = os.getenv("SECRET_KEY")
    if not SECRET_KEY:
        SECRET_KEY: bytes = os.urandom(32)
    ALGORITHM: str = "HS256"

    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "database.db")
    SQLALCHEMY_DATABASE_URI: str = f"sqlite:///{DATABASE_NAME}"

    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 15


    SUPERUSER_EMAIL: str = os.getenv("SUPERUSER_EMAIL", "admin@inspiragen.com")
    SUPERUSER_PASSWORD: str = os.getenv("SUPERUSER_PASSWORD", "")
    SUPERUSER_COMPANY: str = f"{SUPERUSER_EMAIL.split('@')[0]}-default"

    class Config:
        case_sensitive = True
    
settings = ConfigClass()