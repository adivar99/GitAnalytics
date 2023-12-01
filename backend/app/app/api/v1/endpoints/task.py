from typing import Optional, List
from fastapi import HTTPException, Depends, APIRouter, status, Request, BackgroundTasks

from app import crud, models
from app.api import deps
from app.utils.verify_user import verify_user

router = APIRouter()


@router.get("/me", response_model=List[models.Task])
def get_my_tasks(
    db_session: models.Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_user)
):
    tasks = []
    projects = crud.crud_project.get_by_user(db_session, current_user.id)
    for project in projects:
        proj_tasks = crud.crud_task.get_by_project(db_session, project.id)
        tasks += proj_tasks
    return tasks

@router.post("/")
def create_task(
    task_in: models.TaskCreate,
    bg_tasks: BackgroundTasks,
    db_session: models.Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    if not verify_user.can_create_task(db_session, user=current_user, proj_id=task_in.project_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Enough Permissions")
    
    # TODO: Start bg_task to process task and begin model on dataset.
    # bg_tasks()
    task = crud.crud_task.create(db_session, obj_in=task_in)
    return task

@router.get("/project/{proj_id}")
def get_by_project(
    proj_id: int,
    db_session: models.Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user)
):
    if not verify_user.can_access_project(db_session, user=current_user, proj_id=proj_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Enough Permissions")
    tasks = crud.crud_task.get_by_project(db_session, project_id=proj_id)
    return tasks

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    bg_tasks: BackgroundTasks,
    db_session: models.Session = Depends(deps.get_db),
    current_user: models.User = Depends(deps.get_current_active_user),
):
    task = crud.crud_task.get_by_id(db_session, id=task_id)
    if not verify_user.can_delete_task(db_session, user=current_user, proj_id=task.project_id):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not Enough Permissions")
    
    # TODO: Start bg_task to process task deletion.
    # Can we delete model in paperspace?
    # bg_tasks()
    task = crud.crud_task.delete(db_session, obj_in=task_id)
    return task