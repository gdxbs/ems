#Bootstrap employee management system backend
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
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

app = FastAPI(title = "Employee Management System API", version="1.0", lifespan=lifespan)

# CORS Configuration
origins = [
    "http://localhost:5173",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(employee_routes, prefix="/employees")
app.include_router(user_routes, prefix="/users", tags=["Users"])

#Health check endpoint
@app.get("/health")
def health_check():
    return {"status": "API is healthy"}

         