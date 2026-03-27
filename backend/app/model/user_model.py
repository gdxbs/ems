from app.config.database import db
from datetime import datetime
import uuid

def get_user_by_username(username: str):
    return db.users.find_one({"username": username})

def get_user_by_email(email: str):
    return db.users.find_one({"email": email})

def get_user_by_id(userid: str):
    return db.users.find_one({"userid": userid})

def create_user(user_data: dict):
    user_data["userid"] = str(uuid.uuid4())
    user_data["activitylog"] = []
    db.users.insert_one(user_data)
    user = db.users.find_one({"username": user_data["username"]})
    # Remove _id which is ObjectId to make it serializable by Pydantic if returned directly
    if user and "_id" in user:
        user["_id"] = str(user["_id"])
    return user

def capture_user_activity(userid: str, action: str):
    activity = {
        "action": action,
        "timestamp": datetime.utcnow().isoformat()
    }
    db.users.update_one(
        {"userid": userid},
        {"$push": {"activitylog": activity}}
    )
