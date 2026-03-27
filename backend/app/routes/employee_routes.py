from fastapi import APIRouter, Depends
from app.controller.employee_controller import (
    fetch_all_employees,
    fetch_employee_by_id,
    fetch_employees_by_department,
    fetch_employees_by_name,
    modify_employee,
    remove_employee,
    fetch_employee_summary
)
from app.schema.employee_schema import Employee, EmployeeCreate
from app.utils.utils import get_current_user, admin_required

router = APIRouter(dependencies=[Depends(get_current_user)])

@router.get("/", response_model=list[Employee])
def get_employees():
    return fetch_all_employees()

@router.get("/summary")
def get_employee_summary():
    return fetch_employee_summary()

@router.post("/", status_code=201, dependencies=[Depends(admin_required)])
def create_employee_route(employee_data: EmployeeCreate):
    from app.controller.employee_controller import add_employee
    return add_employee(employee_data)

@router.get("/search", response_model=list[Employee])
def search_employees(name: str):
    return fetch_employees_by_name(name)

@router.get("/department/{department}", response_model=list[Employee])
def get_employees_by_dept(department: str):
    return fetch_employees_by_department(department)

@router.get("/{employee_id}", response_model=Employee)
def get_employee(employee_id: str):
    return fetch_employee_by_id(employee_id)

@router.put("/{employee_id}", response_model=Employee, dependencies=[Depends(admin_required)])
def update_employee(employee_id: str, employee_data: EmployeeCreate):
    return modify_employee(employee_id, employee_data)

@router.delete("/{employee_id}", dependencies=[Depends(admin_required)])
def delete_employee(employee_id: str):
    return remove_employee(employee_id)
