# When creating new DB models,
# import them here so that alembic can auto-detect
from app.db.base_class import Base
from app.models.user import User