from pydantic import BaseModel, ConfigDict
from typing import List, Optional
from datetime import datetime
from enum import Enum

class ProjectPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"

class ProjectCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    name: str
    description: Optional[str] = None
    member_ids: List[str] = []
    priority_level: ProjectPriority = ProjectPriority.medium

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    member_ids: List[str]
    owner_id: str
    priority_level: ProjectPriority
    created_at: datetime

class AddMembersRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    member_ids: List[str]
