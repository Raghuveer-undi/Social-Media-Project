from pydantic import BaseModel
from typing import List, Optional

# --- Request Models ---

class IdeaRequest(BaseModel):
    niche: str
    count: Optional[int] = 5

class PlanRequest(BaseModel):
    niche: str
    platforms: List[str]
    duration: Optional[str] = "1 week"

class PostRequest(BaseModel):
    topic: str
    platform: str
    tone: Optional[str] = "professional"

# --- Response Models ---

class IdeaResponse(BaseModel):
    ideas: str

class PlanResponse(BaseModel):
    strategy_and_plan: str

class PostResponse(BaseModel):
    final_content: str