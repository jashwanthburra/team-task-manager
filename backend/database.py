from motor.motor_asyncio import AsyncIOMotorClient
from config import settings

client = AsyncIOMotorClient(
    settings.MONGO_URL,
    serverSelectionTimeoutMS=5000,
    tls=True,
    tlsAllowInvalidCertificates=True,
)
db = client[settings.DB_NAME]

# Collections
users_collection = db["users"]
projects_collection = db["projects"]
tasks_collection = db["tasks"]
