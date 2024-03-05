from typing import List, Optional

from pydantic import BaseModel

class AgentIn(BaseModel):
    proj: str

class AgentResp(BaseModel):
    access_token: str 
    token_type: str
    exp_after_secs: int