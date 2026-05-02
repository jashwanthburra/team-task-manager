from fastapi import APIRouter, Depends
from models.project import ProjectCreate, ProjectResponse, AddMembersRequest
from services import project_service
from utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/projects", tags=["Projects"])

@router.post("/", response_model=ProjectResponse, status_code=201)
async def create_project(data: ProjectCreate, user=Depends(require_admin)):
    """Admin only: create a new project."""
    return await project_service.create_project(data, owner_id=str(user["_id"]))

@router.get("/", response_model=list[ProjectResponse])
async def list_my_projects(user=Depends(get_current_user)):
    """Return all projects the current user owns or is a member of."""
    return await project_service.get_user_projects(user_id=str(user["_id"]))

@router.get("/{project_id}", response_model=ProjectResponse)
async def get_project(project_id: str, user=Depends(get_current_user)):
    """Get a single project (members only)."""
    return await project_service.get_project_by_id(project_id, user_id=str(user["_id"]))

@router.post("/{project_id}/members", response_model=ProjectResponse)
async def add_members(project_id: str, body: AddMembersRequest, user=Depends(get_current_user)):
    """Project owner can add members."""
    return await project_service.add_members(project_id, body.member_ids, owner_id=str(user["_id"]))

@router.get("/{project_id}/members")
async def get_project_members(project_id: str, user=Depends(get_current_user)):
    """Get all members of a project (for assignee dropdown)."""
    return await project_service.get_project_members(project_id, user_id=str(user["_id"]))
