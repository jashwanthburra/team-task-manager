from database import projects_collection
from models.project import ProjectCreate
from bson import ObjectId
from datetime import datetime, timezone
from fastapi import HTTPException

def _serialize(project: dict) -> dict:
    """Convert MongoDB _id to string id."""
    project["id"] = str(project.pop("_id"))
    return project

async def create_project(data: ProjectCreate, owner_id: str) -> dict:
    project = data.model_dump()
    project["owner_id"] = owner_id
    project["created_at"] = datetime.now(timezone.utc)
    result = await projects_collection.insert_one(project)
    return _serialize({**project, "_id": result.inserted_id})

async def get_user_projects(user_id: str) -> list:
    """Return all projects where user is owner or member."""
    cursor = projects_collection.find({
        "$or": [{"owner_id": user_id}, {"member_ids": user_id}]
    })
    return [_serialize(p) async for p in cursor]

async def get_project_by_id(project_id: str, user_id: str) -> dict:
    """Fetch a single project, verify user is a member or owner."""
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    is_owner = project["owner_id"] == user_id
    is_member = user_id in project.get("member_ids", [])
    if not is_owner and not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this project")
    return _serialize(project)

async def add_members(project_id: str, member_ids: list, owner_id: str) -> dict:
    """Add members to a project (owner only)."""
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    if project["owner_id"] != owner_id:
        raise HTTPException(status_code=403, detail="Only the project owner can add members")

    await projects_collection.update_one(
        {"_id": ObjectId(project_id)},
        {"$addToSet": {"member_ids": {"$each": member_ids}}}
    )
    updated = await projects_collection.find_one({"_id": ObjectId(project_id)})
    return _serialize(updated)

async def get_project_members(project_id: str, user_id: str) -> list:
    """Return all members (+ owner) of a project with their name and id."""
    from database import users_collection
    project = await projects_collection.find_one({"_id": ObjectId(project_id)})
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    is_owner = project["owner_id"] == user_id
    is_member = user_id in project.get("member_ids", [])
    if not is_owner and not is_member:
        raise HTTPException(status_code=403, detail="Not a member of this project")

    # Collect all user IDs: owner + members
    all_ids = list(set([project["owner_id"]] + project.get("member_ids", [])))
    object_ids = [ObjectId(uid) for uid in all_ids]
    cursor = users_collection.find({"_id": {"$in": object_ids}}, {"password": 0})
    members = []
    async for u in cursor:
        members.append({"id": str(u["_id"]), "name": u["name"], "email": u["email"]})
    return members
