from enum import Enum

class UserType(str, Enum):
    USER = "user"
    SUPER = "super"
    DEMO = "demo"