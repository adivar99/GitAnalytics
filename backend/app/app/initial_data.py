import logging

from app.db.session import Session
from app.core.init_db import InitDB

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def main():
    db = Session()
    logger.info("Creating initial data")
    _ = InitDB(db)
    logger.info("Initial data creation completed")

if __name__ == "__main__":
    main()