from fastapi import APIRouter

from app.api.v1.endpoints import project, task, login, user

api_router = APIRouter()

api_router.include_router(login.router, prefix="/login", tags=["Login"])
api_router.include_router(project.router, prefix="/project", tags=["Project"])
api_router.include_router(task.router, prefix="/task", tags=["Task"])
api_router.include_router(user.router, prefix="/user", tags=["User"])