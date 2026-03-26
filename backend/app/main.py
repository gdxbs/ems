#Bootstrap employee management system backend
from fastapi import FastAPI
from app.config.database import client, db
from contextlib import asynccontextmanager
from app.routes.employee_routes import router as employee_routes
from app.routes.user_routes import router as user_routes

#Importing the context manager for lifespan events startup and shutdown code
@asynccontextmanager
async def lifespan(app: FastAPI):
    #Startup code
    try:
        info = client.server_info()
        print("Connected to MongoDB successfully!", info)

        print("Starting Employee Management System API...")
    except Exception as e:
        print("Error connecting to MongoDB:", e)
        raise e
    yield
    #Shutdown code
    print("Shutting down Employee Management System API...")

 #Insert into employees collection
#db.employees.insert_one({
#    "employee_id": "E001",
#    "name": "John Doe",
#    "position": "Software Engineer",
#    "department": "Engineering",
#    "email": "john.doe@example.com",
#    "salary": 90000,
#    "status": "active"
#})

app = FastAPI(title = "Employee Management System API", version="1.0", lifespan=lifespan)
app.include_router(employee_routes, prefix="/employees")
app.include_router(user_routes, prefix="/users", tags=["Users"])

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "API is healthy"}

         