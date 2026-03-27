import httpx
import json
import uuid
import asyncio

BASE_URL = "http://localhost:8000"

async def test_apis():
    async with httpx.AsyncClient() as client:
        # 1. Register
        unique_id = str(uuid.uuid4())[:8]
        username = f"testuser_{unique_id}"
        email = f"test_{unique_id}@example.com"
        password = "password123"
        
        print(f"Testing Registration for {username}...")
        reg_response = await client.post(f"{BASE_URL}/users/register", json={
            "username": username,
            "email": email,
            "password": password,
            "role": "admin"
        })
        print(f"Registration status: {reg_response.status_code}")
        
        # 2. Login
        print("Testing Login...")
        login_response = await client.post(f"{BASE_URL}/users/login", json={
            "username": username,
            "password": password
        })
        print(f"Login status: {login_response.status_code}")
        if login_response.status_code != 200:
            print(login_response.text)
            return
            
        token = login_response.json().get("access_token")
        headers = {"Authorization": f"Bearer {token}"}

        # 3. Get All Employees
        print("Testing Get All Employees...")
        get_all_response = await client.get(f"{BASE_URL}/employees/", headers=headers)
        print(f"Get All status: {get_all_response.status_code}")
        if get_all_response.status_code == 200:
             print(f"Current employee count: {len(get_all_response.json())}")
        else:
             print(f"Error: {get_all_response.text}")

        # 4. Search by Name
        print("Testing Search by Name...")
        search_name_response = await client.get(f"{BASE_URL}/employees/search?name=Test", headers=headers)
        print(f"Search Name status: {search_name_response.status_code}")

        # 5. Search by Department
        print("Testing Search by Department...")
        search_dept_response = await client.get(f"{BASE_URL}/employees/search?department=Engineering", headers=headers)
        print(f"Search Dept status: {search_dept_response.status_code}")

if __name__ == "__main__":
    try:
        asyncio.run(test_apis())
    except Exception as e:
        print(f"Test failed: {e}")
