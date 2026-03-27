import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.utils.utils import create_access_token

client = TestClient(app)

def get_auth_headers():
    token = create_access_token(data={"sub": "testuser", "role": "admin"})
    return {"Authorization": f"Bearer {token}"}

def test_unauthorized_access():
    response = client.get("/employees")
    assert response.status_code == 401

#Test cases for the GET /employees endpoint
def test_get_employees():
    response = client.get("/employees", headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

#Test cases for the POST /EMPLOYEE ENDPOINT TO ADD A NEW EMPLOYEE
def test_add_employee():
    client.delete("/employees/E002", headers=get_auth_headers())  # Ensure clean state
    payload = {
        "employee_id": "E002",
        "name": "Jane Smith",
        "position": "Product Manager",
        "department": "Product",
        "email": "jane.smith@example.com",
        "salary": 95000.0,
        "status": "active"
    }
    response = client.post("/employees", json=payload, headers=get_auth_headers())
    assert response.status_code == 201
    data = response.json()
    assert data["message"] == "Employee created successfully"
    
    # Test invalid email
    bad_email_payload = payload.copy()
    bad_email_payload["email"] = "not-an-email"
    response = client.post("/employees", json=bad_email_payload, headers=get_auth_headers())
    assert response.status_code == 422
    
    # Test duplicate employee
    response = client.post("/employees", json=payload, headers=get_auth_headers())
    assert response.status_code == 400

    # Test duplicate email validation
    duplicate_email_payload = payload.copy()
    duplicate_email_payload["employee_id"] = "E003" # New ID but same email
    response = client.post("/employees", json=duplicate_email_payload, headers=get_auth_headers())
    assert response.status_code == 400
    assert response.json()["detail"] == "Employee with this email already exists"

#Update an employee test case /employee/{employee_id} PUT endpoint
def test_update_employee():
    payload = {
        "employee_id": "E002",
        "name": "Updated Name",
        "position": "Senior Product Manager",
        "department": "Product",
        "email": "updated@example.com",
        "salary": 110000.0,
        "status": "active"
    }
    response = client.put("/employees/E002", json=payload, headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Updated Name"
    
    # Update non-existent
    response = client.put("/employees/NON_EXISTENT", json=payload, headers=get_auth_headers())
    assert response.status_code == 404

#Get an employee by ID test case /employee/{employee_id} GET endpoint
def test_get_employee_by_id():
    response = client.get("/employees/E002", headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["employee_id"] == "E002"
    
    response = client.get("/employees/NON_EXISTENT", headers=get_auth_headers())
    assert response.status_code == 404

#Get an employee by department test case /employee/department/{department} GET endpoint
def test_get_employee_by_department():
    response = client.get("/employees/department/Product", headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["department"] == "Product"

#Delete an employee test case /employee/{employee_id} DELETE endpoint
def test_delete_employee():
    response = client.delete("/employees/E002", headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Employee deleted successfully"
    
    response = client.delete("/employees/NON_EXISTENT", headers=get_auth_headers())
    assert response.status_code == 404

#Test cases for the GET /employees/summary endpoint
def test_get_employee_summary():
    response = client.get("/employees/summary", headers=get_auth_headers())
    assert response.status_code == 200
    data = response.json()
    assert "total_employees" in data
    assert "departments" in data
    assert isinstance(data["total_employees"], int)
    assert isinstance(data["departments"], list)