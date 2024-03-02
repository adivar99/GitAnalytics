from fastapi import APIRouter

from app.api.v1.endpoints import project, agent, login, user

api_router = APIRouter()

api_router.include_router(login.router, prefix="/login", tags=["Login"])
api_router.include_router(project.router, prefix="/project", tags=["Project"])
api_router.include_router(agent.router, prefix="/agent", tags=["agent"])
api_router.include_router(user.router, prefix="/user", tags=["User"])
