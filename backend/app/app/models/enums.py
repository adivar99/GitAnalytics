from enum import Enum


class ProjectAccess(int, Enum):
    MANAGER = 1
    READ_WRITE = 2
    GUEST = 3


class UserType(str, Enum):
    USER = "user"
    SUPER = "super"
    DEMO = "demo"


class TaskType(str, Enum):
    STYLE = "style"
    RETRIEVE = "retrieve"


class TaskStatus(str, Enum):
    NOT_STARTED = "not_started"
    RUNNING = "running"
    PROCESSING = "processing"
    STOPPED = "stopped"
    FINISHED = "finished"
    ERROR = "error"


class Permissions(str, Enum):
    # Task
    ACCESS_TASK = "task.access"
    CREATE_TASK = "task.create"
    UPDATE_TASK = "task.update"
    DELETE_TASK = "task.delete"

    # Project
    ACCESS_PROJECT = "project.access"
    CREATE_PROJECT = "project.create"
    UPDATE_PROJECT = "project.update"
    DELETE_PROJECT = "project.delete"

    # Company
    ACCESS_COMPANY = "company.access"
    CREATE_COMPANY = "company.create"
    UPDATE_COMPANY = "company.update"
    DELETE_COMPANY = "company.delete"

    # User
    ACCESS_USERS = "users.access"
    CREATE_USERS = "users.create"
    UPDATE_USERS = "users.update"
    DELETE_USERS = "users.delete"

class ProjectStatus(str, Enum):
    PENDING = "pending"
    APPROVED = "approved"
    REJECTED = "rejected"
    