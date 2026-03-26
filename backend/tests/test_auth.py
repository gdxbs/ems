import pytest
import pytest_asyncio
from httpx import AsyncClient
from datetime import datetime, timedelta
from jose import jwt

# --- MOCK APP IMPORT ---
# In a real scenario, you would import your FastAPI app:
# from app.main import app 
# Note: Ensure your app handles password hashing and same 401 exceptions for invalid/nonexistent users!

# Constants for JWT generation in tests
SECRET_KEY = "mysecretkey123"
ALGORITHM = "HS256"

# -- FIXTURES --

@pytest_asyncio.fixture()
async def client():
    # Import your FastAPI app here natively.
    # For testing async Motor endpoints, httpx.AsyncClient is preferred.
    from app.main import app
    from httpx import ASGITransport
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac

@pytest.fixture(autouse=True)
def clean_db():
    from app.config.database import db
    db.users.delete_many({})
    db.employees.delete_many({})
    yield
    db.users.delete_many({})
    db.employees.delete_many({})

@pytest.fixture
def generate_token():
    def _generate_token(username: str, role: str, expires_delta_minutes: int = 15):
        expire = datetime.utcnow() + timedelta(minutes=expires_delta_minutes)
        to_encode = {"sub": username, "role": role, "exp": expire}
        return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return _generate_token


# -- TESTS --

@pytest.mark.asyncio
async def test_register_user_success(client: AsyncClient, clean_db):
    payload = {
        "username": "new_user",
        "email": "newuser@example.com",
        "password": "StrongPassword123!",
        "role": "user"
    }
    response = await client.post("/users/register", json=payload)
    assert response.status_code == 201 or response.status_code == 200
    data = response.json()
    assert data["username"] == "new_user"

@pytest.mark.asyncio
async def test_register_duplicate_username_returns_409(client: AsyncClient, clean_db):
    payload = {
        "username": "duplicate_user",
        "email": "dup@example.com",
        "password": "StrongPassword123!",
        "role": "user"
    }
    # Register first time
    await client.post("/users/register", json=payload)
    
    # Attempt duplicate
    response = await client.post("/users/register", json=payload)
    assert response.status_code == 409

@pytest.mark.asyncio
async def test_register_weak_password_returns_422(client: AsyncClient):
    payload = {
        "username": "weak_user",
        "email": "weak@example.com",
        "password": "abc", # Weak password
        "role": "user"
    }
    response = await client.post("/users/register", json=payload)
    assert response.status_code == 422 # Standard validation error code

@pytest.mark.asyncio
async def test_login_success_returns_jwt(client: AsyncClient, clean_db):
    # Register user first
    payload = {
        "username": "login_user",
        "email": "login@example.com",
        "password": "StrongPassword123!",
        "role": "user"
    }
    await client.post("/users/register", json=payload)
    
    # Login
    login_payload = {
        "username": "login_user",
        "password": "StrongPassword123!"
    }
    response = await client.post("/users/login", json=login_payload)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password_returns_401(client: AsyncClient, clean_db):
    # Register user
    payload = {
        "username": "auth_user",
        "email": "auth@example.com",
        "password": "StrongPassword123!",
        "role": "user"
    }
    await client.post("/users/register", json=payload)
    
    # Login with bad pass
    login_payload = {
        "username": "auth_user",
        "password": "WrongPassword!"
    }
    response = await client.post("/users/login", json=login_payload)
    assert response.status_code == 401
    assert response.json() == {"detail": "Incorrect username or password"} # Standardized 401 response

@pytest.mark.asyncio
async def test_login_nonexistent_user_returns_401(client: AsyncClient):
    login_payload = {
        "username": "ghost_user",
        "password": "SomePassword123!"
    }
    response = await client.post("/users/login", json=login_payload)
    assert response.status_code == 401
    # IMPORTANT: Response MUST be identical to wrong password to prevent user enumeration
    assert response.json() == {"detail": "Incorrect username or password"}

@pytest.mark.asyncio
async def test_protected_route_without_token_returns_401(client: AsyncClient):
    # Attempting to fetch employees without Auth header
    response = await client.get("/employees/")
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_protected_route_with_valid_token_succeeds(client: AsyncClient, generate_token):
    token = generate_token("test_user", "user")
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await client.get("/employees/", headers=headers)
    assert response.status_code == 200

@pytest.mark.asyncio
async def test_protected_route_with_expired_token_returns_401(client: AsyncClient, generate_token):
    # Create token expired 10 minutes ago
    token = generate_token("test_user", "user", expires_delta_minutes=-10)
    headers = {"Authorization": f"Bearer {token}"}
    
    response = await client.get("/employees/", headers=headers)
    assert response.status_code == 401
    assert response.json().get("detail") == "Could not validate credentials"

@pytest.mark.asyncio
async def test_admin_route_with_user_role_returns_403(client: AsyncClient, generate_token):
    token = generate_token("standard_user", "user")
    headers = {"Authorization": f"Bearer {token}"}
    
    # Try to access a POST route that demands Admin privileges
    employee_payload = {
        "employee_id": "E100",
        "name": "Should Fail",
        "position": "Fail",
        "department": "Fail",
        "email": "fail@example.com",
        "salary": 0,
        "status": "active"
    }
    response = await client.post("/employees/", json=employee_payload, headers=headers)
    assert response.status_code == 403
    assert response.json().get("detail") == "Admin privileges required"
