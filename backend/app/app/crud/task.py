from sqlalchemy.orm import Session
from datetime import datetime
from typing import Optional, List

from app.models import Task as model, TaskCreate as model_create, TaskUpdate as model_update
from app.db_models.task import Task as db_model
from app.models.enums import TaskType, TaskStatus

class CRUDTask():
    def get_by_id(self, db_session: Session, id: int) -> Optional[model]:
        """
        Return Task by Id
        """
        return (
            db_session.query(db_model)
            .filter(db_model.id == id)
            .first()
        )

    def get_multi(self, db_session: Session, skip: int = 0, limit=100) -> List[model]:
        """
        Return all tasks
        """
        return (
            db_session
            .query(db_model)
            .offset(skip)
            .limit(limit)
            .all()
        )
    
    def get_running(self, db_session: Session) -> List[model]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.status == TaskStatus.RUNNING)
            .all()
        )
    
    def get_by_project(self, db_session: Session, project_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.project_id == project_id)
            .all()
        )
    
    def get_status_by_project(self, db_session: Session, *, status: TaskStatus, project_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.status == status)
            .filter(db_model.project_id == project_id)
            .all()
        )
    
    def get_type_by_project(self, db_session: Session, *, type: TaskType, project_id: int) -> List[model]:
        return (
            db_session
            .query(db_model)
            .filter(db_model.type == type)
            .filter(db_model.project_id == project_id)
            .all()
        )


    def create(self, db_session: Session, obj_in: model_create) -> db_model:
        """
        Create task instance in db
        """
        obj_in.created = datetime.now()
        json_data = obj_in.dict(exclude_unset=True)
        db_obj = db_model(**json_data)
        db_session.add(db_obj)
        db_session.commit()
        # db_session.refresh(db_obj)
        return db_obj


    def update(self, db_session: Session, id: int, obj_in: model_update):
        """
        update details of task based on input id
        """
        task = self.get_by_id(db_session, id)
        if task is None:
            return None
        update_data = obj_in.dict(exclude_unset=True)
        for field in update_data:
            setattr(task, field, getattr(obj_in, field))
        db_session.add(task)
        db_session.commit()
        # db_session.refresh(db_model)
        return task


    def delete(self, db_session: Session, id: int):
        """
        Delete task based on input id
        """
        if id not in self.get_ids(db_session):
            print("task doesn't exist")
            return (False, "Task does not exist")
        try:
            task = db_session.query(db_model).get(id)
            db_session.delete(task)
            db_session.commit()
            print("deleted")
            return (True, "Success")
        except Exception as e:
            print("Not deleted. Error raised: "+str(e))
            return (False, str(e))

crud_task = CRUDTask()