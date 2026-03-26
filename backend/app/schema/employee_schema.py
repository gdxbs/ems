from pydantic import BaseModel, EmailStr, Field
from datetime import datetime

class Employee(BaseModel):
    employee_id: str = Field(..., description="Unique employee identifier")
    name: str = Field(..., description="Full name of the employee")
    position: str = Field(..., description="Job title")
    department: str = Field(..., description="Department where the employee works")
    email: EmailStr = Field(..., description="Valid corporate email address")
    salary: float = Field(..., ge=0, description="Salary amount, must be non-negative")
    status: str = Field(..., description="Employment status (e.g., active, inactive)")

class EmployeeResponse(BaseModel):
    id: str
    createdAt: datetime = Field(default_factory=datetime.utcnow)

class EmployeeCreate(BaseModel):
    employee_id: str = Field(..., description="Unique employee identifier")
    name: str = Field(..., description="Full name of the employee")
    position: str = Field(..., description="Job title")
    department: str = Field(..., description="Department where the employee works")
    email: EmailStr = Field(..., description="Valid corporate email address")
    salary: float = Field(..., ge=0, description="Salary amount, must be non-negative")
    status: str = Field(..., description="Employment status (e.g., active, inactive)")
    createdAt: datetime = Field(default_factory=datetime.utcnow)