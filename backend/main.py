from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from schemas import (
    IdeaRequest, IdeaResponse,
    PlanRequest, PlanResponse,
    PostRequest, PostResponse
)
from agents import SocialMediaAgent

app = FastAPI(title="Social Media Agent API")

# Allow CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # allowing "*" is fine for now
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize the unified agent
agent = SocialMediaAgent()

@app.get("/")
async def health_check():
    return {"status": "healthy", "agent": "Active"}

@app.post("/generate-ideas", response_model=IdeaResponse)
async def generate_ideas(request: IdeaRequest):
    try:
        ideas_text = agent.generate_ideas(request.niche, request.count)
        return IdeaResponse(ideas=ideas_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-plan", response_model=PlanResponse)
async def generate_plan(request: PlanRequest):
    try:
        plan_text = agent.generate_plan_with_trends(
            request.niche, 
            request.platforms, 
            request.duration
        )
        return PlanResponse(strategy_and_plan=plan_text)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/generate-post", response_model=PostResponse)
async def generate_post(request: PostRequest):
    try:
        # This triggers the full Research -> Draft -> Refine loop
        final_post = agent.create_fact_based_post(
            request.topic, 
            request.platform, 
            request.tone
        )
        return PostResponse(final_content=final_post)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
