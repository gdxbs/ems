from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()
client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]
result = db.users.update_one({"email": "admin@example.com"}, {"$set": {"role": "admin"}})
print(f"Updated {result.modified_count} users")
