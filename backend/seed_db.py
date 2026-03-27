from pymongo import MongoClient
import os
from dotenv import load_dotenv
from passlib.context import CryptContext
import uuid

load_dotenv()

# Setup password hashing to match backend
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

client = MongoClient(os.getenv("MONGO_URI"))
db = client[os.getenv("MONGO_DB_NAME")]

def seed():
    # 1. Clear existing data (optional, but good for clean state)
    db.users.delete_many({})
    db.employees.delete_many({})
    
    # 2. Add Admin User
    admin_password_hash = pwd_context.hash("password123")
    db.users.insert_one({
        "userid": str(uuid.uuid4()),
        "username": "Admin User",
        "email": "admin@example.com",
        "password": admin_password_hash,
        "role": "admin",
        "activitylog": []
    })
    
    # 3. Add Regular User
    user_password_hash = pwd_context.hash("password123")
    db.users.insert_one({
        "userid": str(uuid.uuid4()),
        "username": "Regular User",
        "email": "user@example.com",
        "password": user_password_hash,
        "role": "user",
        "activitylog": []
    })
    
    # 4. Add Sample Employees
    employees = [
        {
            "employee_id": "EMP001",
            "name": "Sarah Chen",
            "position": "Senior Frontend Developer",
            "department": "Engineering",
            "email": "sarah.chen@example.com",
            "salary": 125000,
            "status": "active"
        },
        {
            "employee_id": "EMP002",
            "name": "James Wilson",
            "position": "Product Manager",
            "department": "Product",
            "email": "james.wilson@example.com",
            "salary": 110000,
            "status": "active"
        },
        {
            "employee_id": "EMP003",
            "name": "Maria Garcia",
            "position": "HR Specialist",
            "department": "HR",
            "email": "maria.garcia@example.com",
            "salary": 85000,
            "status": "active"
        },
        {
            "employee_id": "EMP004",
            "name": "David Kim",
            "position": "Backend Engineer",
            "department": "Engineering",
            "email": "david.kim@example.com",
            "salary": 115000,
            "status": "active"
        },
        {
            "employee_id": "EMP005",
            "name": "Elena Rossi",
            "position": "UX Designer",
            "department": "Design",
            "email": "elena.rossi@example.com",
            "salary": 95000,
            "status": "inactive"
        }
    ]
    db.employees.insert_many(employees)
    
    print("Database seeded successfully!")
    print(f"Inserted 2 users and {len(employees)} employees.")

if __name__ == "__main__":
    seed()
