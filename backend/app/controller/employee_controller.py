#Controller for employee-related operations/business logic
import logging
from fastapi import HTTPException
from app.model.employee_model import get_all_employees, get_employee_by_id, get_employees_by_department, update_employee, delete_employee, create_employee, get_employees_by_name, get_employee_summary, get_employee_by_email
from app.schema.employee_schema import Employee, EmployeeCreate

logger = logging.getLogger(__name__)

#Controller function to handle GET /employees endpoint
def fetch_all_employees():
    try:
        employees = get_all_employees()
        return [Employee(**emp) for emp in employees]
    except Exception as e:
        logger.error(f"Error fetching employees: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def fetch_employee_summary():
    try:
        return get_employee_summary()
    except Exception as e:
        logger.error(f"Error fetching employee summary: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def add_employee(employee_data: EmployeeCreate):
    try:
        # Check if already exists
        if get_employee_by_id(employee_data.employee_id):
            raise HTTPException(status_code=400, detail="Employee already exists")
        
        # Check for duplicate email
        if get_employee_by_email(employee_data.email):
            raise HTTPException(status_code=400, detail="Employee with this email already exists")

        employee_dict = employee_data.model_dump()
        create_employee(employee_dict)
        employee_dict.pop("_id", None)
        return {"message": "Employee created successfully", **employee_dict}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Error creating employee: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def fetch_employee_by_id(employee_id: str):
    try:
        employee = get_employee_by_id(employee_id)
        if not employee:
            raise HTTPException(status_code=404, detail="Employee not found")
        return Employee(**employee)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Error fetching employee by ID: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def fetch_employees_by_department(department: str):
    try:
        employees = get_employees_by_department(department)
        return [Employee(**emp) for emp in employees]
    except Exception as e:
        logger.error(f"Error fetching employees by department: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def fetch_employees_by_name(name: str):
    try:
        employees = get_employees_by_name(name)
        return [Employee(**emp) for emp in employees]
    except Exception as e:
        logger.error(f"Error fetching employees by name: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def modify_employee(employee_id: str, employee_data: EmployeeCreate):
    try:
        updated = update_employee(employee_id, employee_data.model_dump())
        if not updated:
            # Check if employee exists
            if not get_employee_by_id(employee_id):
                raise HTTPException(status_code=404, detail="Employee not found")
        return get_employee_by_id(employee_id)
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Error updating employee: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")

def remove_employee(employee_id: str):
    try:
        deleted = delete_employee(employee_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Employee not found")
        return {"message": "Employee deleted successfully"}
    except Exception as e:
        if isinstance(e, HTTPException): raise e
        logger.error(f"Error deleting employee: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")