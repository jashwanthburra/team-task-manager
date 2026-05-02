from pydantic_settings import BaseSettings
from pydantic import Field

class Settings(BaseSettings):
    MONGO_URL: str = Field(default="mongodb://localhost:27017")
    DB_NAME: str = Field(default="team_task_manager")
    JWT_SECRET: str = Field(default="changeme")
    JWT_ALGORITHM: str = Field(default="HS256")
    JWT_EXPIRE_MINUTES: int = Field(default=60)

    model_config = {
        "env_file": ".env",
        "env_file_encoding": "utf-8",
    }

settings = Settings()
