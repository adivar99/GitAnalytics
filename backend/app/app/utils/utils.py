import re
import uuid
import string
from random import randint, choice

from app.db.session import Session

def get_db():
    """
    Return Session variable
    """
    try:
        db = Session()
        yield db
    finally:
        db.close()


def get_randID(ids: list):
    """
    Return random integer between 0->999999 which doesn't exist in input ids list
    """
    id = randint(0, 999999)
    while id in ids:
        id = randint(0, 999999)
    
    return id

def valid_email(email: str) -> bool:
    email_regex = r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b'
    return re.fullmatch(email_regex, email)

def get_random_str(n=32):
    alpha = string.ascii_letters
    num = string.digits
    return "".join(choice(alpha+num, k=n))
    
def get_uuid():
    return uuid.uuid4()

def get_uuid_int():
    return uuid.uuid4().int >> (128-32)