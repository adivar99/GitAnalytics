from typing import List, Optional

from pydantic import BaseModel


class TokenIn(BaseModel):
    proj: str

class Token(BaseModel):
    access_token: str
    token_type: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    scopes: Optional[List[str]] = []
