from fastapi import APIRouter

from app.api.v1.endpoints import login, user

api_router = APIRouter()

# Import the router from each of the API files here

api_router.include_router(login.router, prefix="/login", tags=["Login"])
api_router.include_router(user.router, prefix="/user", tags=["User"])