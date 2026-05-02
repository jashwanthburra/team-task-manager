from database import tasks_collection, projects_collection
from models.task import TaskCreate, TaskStatus
from bson import ObjectId
from datetime import datetime, date, timezone
from fastapi import HTTPException

def _serialize(task: dict) -> dict:
    """Convert _id to id and ensure date fields are serializable."""
    task["id"] = str(task.pop("_id"))
    return task

async def _verify_project_member(project_id: str, user_id: str):
    """Raise 403 if user is not a member or owner of the project."""
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    is_owner = project["owner_id"] == user_id
    is_member = user_id in project.get("member_ids", [])
    if not is_owner and not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this project")

async def create_task(data: TaskCreate, creator_id: str) -> dict:
    await _verify_project_member(data.project_id, creator_id)
    task = data.model_dump()
    task["creator_id"] = creator_id
    task["created_at"] = datetime.now(timezone.utc)
    # Default assigned_to to the creator if not specified
    if not task.get("assigned_to"):
        task["assigned_to"] = creator_id
    # Convert date to datetime for MongoDB storage
    if task.get("due_date"):
        task["due_date"] = datetime.combine(task["due_date"], datetime.min.time())
    result = await tasks_collection.insert_one(task)
    return _serialize({**task, "_id": result.inserted_id})

async def get_tasks_by_project(project_id: str, user_id: str) -> list:
    await _verify_project_member(project_id, user_id)
    cursor = tasks_collection.find({"project_id": project_id})
    return [_serialize(t) async for t in cursor]

async def get_my_tasks(user_id: str) -> list:
    """Return all tasks assigned to or created by the current user."""
    cursor = tasks_collection.find({
        "$or": [{"assigned_to": user_id}, {"creator_id": user_id}]
    })
    seen = set()
    tasks = []
    async for t in cursor:
        tid = str(t["_id"])
        if tid not in seen:
            seen.add(tid)
            tasks.append(_serialize(t))
    return tasks

async def update_task_status(task_id: str, status: TaskStatus, user_id: str) -> dict:
    task = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    await _verify_project_member(task["project_id"], user_id)
    await tasks_collection.update_one(
        {"_id": ObjectId(task_id)},
        {"$set": {"status": status, "updated_at": datetime.now(timezone.utc)}}
    )
    updated = await tasks_collection.find_one({"_id": ObjectId(task_id)})
    return _serialize(updated)

async def delete_task(task_id: str) -> None:
    """Admin only: delete a task."""
    result = await tasks_collection.delete_one({"_id": ObjectId(task_id)})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Task not found")
