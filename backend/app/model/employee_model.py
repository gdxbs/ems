#Query the database for employee information
import re
from app.config.database import db

#Get all employees from the database
def get_all_employees():
    return list(db.employees.find({}, {"_id": 0}))

def create_employee(employee_data: dict):
    db.employees.insert_one(employee_data)
    return True

def get_employee_by_id(employee_id: str):
    return db.employees.find_one({"employee_id": employee_id}, {"_id": 0})

def get_employees_by_department(department: str):
    escaped_dept = re.escape(department)
    return list(db.employees.find({"department": {"$regex": f"^{escaped_dept}$", "$options": "i"}}, {"_id": 0}))

def get_employees_by_name(name: str | None = None, department: str | None = None):
    query = {}
    if name:
        escaped_name = re.escape(name)
        query["name"] = {"$regex": escaped_name, "$options": "i"}
    if department:
        escaped_dept = re.escape(department)
        query["department"] = {"$regex": f"^{escaped_dept}$", "$options": "i"}
    
    return list(db.employees.find(query, {"_id": 0}))

def update_employee(employee_id: str, employee_data: dict):
    result = db.employees.update_one(
        {"employee_id": employee_id},
        {"$set": employee_data}
    )
    return result.modified_count > 0

def delete_employee(employee_id: str):
    result = db.employees.delete_one({"employee_id": employee_id})
    return result.deleted_count > 0