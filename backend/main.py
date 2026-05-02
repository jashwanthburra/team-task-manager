from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, project, task, dashboard, admin
from database import client

app = FastAPI(
    title="Team Task Manager API",
    description="JWT-authenticated project and task management backend",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def verify_mongo_connection():
    try:
        await client.admin.command("ping")
        print("✅ MongoDB connected successfully")
    except Exception as e:
        print(f"❌ MongoDB connection failed: {e}")

app.include_router(auth.router)
app.include_router(project.router)
app.include_router(task.router)
app.include_router(dashboard.router)
app.include_router(admin.router)

@app.get("/", tags=["Health"])
def health_check():
    return {"status": "ok", "app": "Team Task Manager"}
