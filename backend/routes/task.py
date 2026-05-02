from fastapi import APIRouter, Depends
from models.task import TaskCreate, TaskResponse, TaskStatusUpdate
from services import task_service
from utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/tasks", tags=["Tasks"])

@router.post("/", response_model=TaskResponse, status_code=201)
async def create_task(data: TaskCreate, user=Depends(get_current_user)):
    """Create a task (project members only)."""
    return await task_service.create_task(data, creator_id=str(user["_id"]))

@router.get("/me", response_model=list[TaskResponse])
async def get_my_tasks(user=Depends(get_current_user)):
    """Get all tasks assigned to the current user."""
    return await task_service.get_my_tasks(user_id=str(user["_id"]))

@router.get("/project/{project_id}", response_model=list[TaskResponse])
async def get_project_tasks(project_id: str, user=Depends(get_current_user)):
    """Get all tasks for a project (members only)."""
    return await task_service.get_tasks_by_project(project_id, user_id=str(user["_id"]))

@router.patch("/{task_id}/status", response_model=TaskResponse)
async def update_status(task_id: str, body: TaskStatusUpdate, user=Depends(get_current_user)):
    """Update task status (project members only)."""
    return await task_service.update_task_status(task_id, body.status, user_id=str(user["_id"]))

@router.delete("/{task_id}", status_code=204)
async def delete_task(task_id: str, user=Depends(require_admin)):
    """Admin only: permanently delete a task."""
    await task_service.delete_task(task_id)
