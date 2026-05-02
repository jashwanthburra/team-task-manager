from fastapi import APIRouter, Depends
from services import dashboard_service
from utils.dependencies import get_current_user

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/")
async def get_dashboard(user=Depends(get_current_user)):
    """
    Returns task stats for the current user:
    - total tasks assigned
    - breakdown by status
    - overdue tasks
    - productivity score (% completed)
    """
    return await dashboard_service.get_dashboard(user_id=str(user["_id"]))
