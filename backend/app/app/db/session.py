from sqlite3 import Connection

from sqlalchemy import create_engine, event
from sqlalchemy.engine import Engine
from sqlalchemy.orm import scoped_session, sessionmaker

from app.core.config import settings

# from db import base

engine = create_engine(
    settings.SQLALCHEMY_DATABASE_URI,
    connect_args={'check_same_thread': False}
)
db_session = scoped_session(sessionmaker(autocommit=False, autoflush=False, bind=engine))

Session = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# enable foreign keys for all sqlite3 db connections
@event.listens_for(Engine, "connect")
def _set_sqlite_pragma(dbapi_connection, connection_record):
    if isinstance(dbapi_connection, Connection):
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()