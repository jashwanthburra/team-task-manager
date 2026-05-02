from pydantic import BaseModel, ConfigDict
from typing import Optional
from enum import Enum
from datetime import date, datetime

class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"

class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class TaskCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    title: str
    description: Optional[str] = None
    project_id: str
    assigned_to: Optional[str] = None   # user_id of assignee
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.medium
    due_date: Optional[date] = None

class TaskStatusUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    status: TaskStatus

class TaskResponse(BaseModel):
    id: str
    title: str
    description: Optional[str]
    project_id: str
    assigned_to: Optional[str]
    status: TaskStatus
    priority: TaskPriority
    due_date: Optional[date]
    creator_id: str
    created_at: datetime
