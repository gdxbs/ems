# Codebase Overview

Welcome to the Employee Management System! This document provides a comprehensive overview of the entire codebase, structured to help technical recruiters and new engineers quickly understand the architecture, purpose of each component, and overall layout of the repository.

---

## 1. High-Level Architecture

The project is a full-stack application divided into three main components:

1.  **Frontend**: A React application built with Vite and TypeScript. It utilizes Tailwind CSS for styling and `shadcn/ui` (via Radix UI primitives) for components. State management is handled primarily via React Contexts.
2.  **Backend**: A Python-based REST API built with FastAPI. It uses MongoDB (via `pymongo`) as the database. Data validation is managed by Pydantic.
3.  **Infrastructure (IaC)**: Terraform configuration to provision AWS resources (EC2, Security Groups, SSH Key Pairs) for deploying the application.

---

## 2. Repository Structure

The repository root contains three main folders corresponding to the architecture:

*   `backend/`: Python FastAPI application and testing scripts.
*   `frontend/`: React + Vite web application.
*   `terraform/`: AWS Infrastructure as Code.

There are also a few root-level files like `README.md` and `package-lock.json`.

---

## 3. Backend Deep Dive (`/backend`)

The backend is organized using a layered architecture to separate concerns (Routing -> Controller -> Model).

### Application Entry Point
*   **`main.py`** & **`app/main.py`**: The entry point of the FastAPI application. It configures CORS, mounts the routers for `/employees` and `/users`, defines the database connection lifecycle (startup/shutdown events), and provides a `/health` check endpoint.

### Configuration (`app/config/`)
*   **`database.py`**: Handles connecting to the MongoDB database using `pymongo`. It loads credentials (`MONGO_URI` and `MONGO_DB_NAME`) from environment variables via `dotenv`.

### Routing (`app/routes/`)
This layer defines the API endpoints and delegates requests to controllers.
*   **`employee_routes.py`**: Defines CRUD operations for employees (`GET /`, `POST /`, `GET /{id}`, `PUT /{id}`, `DELETE /{id}`) and search endpoints. It relies on `Depends(get_current_user)` to ensure routes are authenticated, and `Depends(admin_required)` for destructive/creation operations.
*   **`user_routes.py`**: Handles authentication endpoints (`POST /register` and `POST /login`).

### Controllers (`app/controller/`)
This layer holds the business logic, bridging the routers and the models.
*   **`employee_controller.py`**: Functions like `fetch_all_employees`, `add_employee`, etc. It handles HTTPExceptions (e.g., returning 404 if an employee isn't found or 400 if an employee already exists).
*   **`user_controller.py`**: Manages user registration (hashing passwords) and login (verifying credentials and returning JWT tokens).

### Models (`app/model/`)
This layer handles direct database interactions.
*   **`employee_model.py`**: Functions that execute raw MongoDB queries (e.g., `db.employees.find(...)`, `db.employees.insert_one(...)`). It includes search capabilities using Regex for names and departments.
*   **`user_model.py`**: Functions for user management and capturing user activity logs (e.g., login times).

### Schemas (`app/schema/`)
Defines Pydantic models used for input validation and output serialization.
*   **`employee_schema.py`**: Defines `Employee`, `EmployeeCreate`, and `EmployeeResponse`. It enforces rules like `EmailStr` for valid emails and `ge=0` for non-negative salaries.
*   **`user_schema.py`**: Defines `UserCreate`, `UserLogin`, and `UserResponse`, including nested `ActivityLog` schemas.

### Utilities (`app/utils/`)
*   **`utils.py`**: Contains authentication and security utilities. It manages JWT creation (`create_access_token`), password hashing/verification using `passlib` (Argon2), and FastAPI dependencies (`get_current_user`, `admin_required`) to secure endpoints.

### Tests and Testing Configuration (`tests/`)
The backend is tested using `pytest` and `pytest-asyncio`. A local MongoDB instance (`mongod`) is required to run the tests.
*   **`tests/conftest.py`**: Contains shared Pytest fixtures.
*   **`tests/employees_test.py`**: Uses `fastapi.testclient.TestClient` to test the API endpoints. It mocks authorization headers by generating valid admin JWT tokens using `create_access_token` and validates the HTTP response codes and JSON bodies (e.g., asserting a `201` status code and a success message when an employee is successfully created).
*   **`tests/test_auth.py`**: Tests authentication logic such as duplicate username registration handling, weak password validations, login functionality, and role-based access to protected routes.

### Configuration & Dependency Files
*   **`requirements.txt`**: Lists all Python dependencies such as `fastapi`, `pymongo`, `pytest`, `pydantic`, `python-jose`, and `passlib`.

---

## 4. Frontend Deep Dive (`/frontend`)

The frontend is a modern React application utilizing Vite for fast bundling.

### Entry Points
*   **`src/main.tsx`**: Bootstraps the React application and mounts it to the DOM.
*   **`src/App.tsx`**: Sets up the global context providers (`AuthProvider`, `EmployeeProvider`), the router (`RouterProvider`), and the toast notification system (`Toaster` from `sonner`).
*   **`src/routes.tsx`**: Defines the application's routing map using React Router.

### API Integration (`src/api/`)
*   **`axios.js`**: Configures an Axios instance pointing to the FastAPI backend (`http://localhost:8000`). It includes interceptors to automatically attach the JWT token from `localStorage` to requests, and handles 401 Unauthorized errors by logging the user out.

### Contexts / State Management (`src/contexts/`)
*   **`auth-context.tsx`**: Manages user authentication state, handles login/logout functions, and persists the JWT token.
*   **`employee-context.tsx`**: Fetches and stores the global state of employees, providing functions to add, update, delete, and search employees.

### Pages (`src/pages/`)
*   **`login.tsx` & `register.tsx`**: Authentication pages.
*   **`dashboard.tsx`**: Displays analytics and charts (using `recharts`) showing total employees, active vs. inactive counts, and department distribution.
*   **`employee-directory.tsx`**: A read-only view of employees with search and filter capabilities.
*   **`employee-management.tsx`**: An admin-focused page that includes a data table for managing (creating, editing, deleting) employee records.

### Components (`src/components/`)
*   **`ui/`**: A collection of reusable UI components (Buttons, Inputs, Dialogs, Cards, etc.) heavily based on `shadcn/ui` and Radix UI. These are styled using Tailwind CSS and `class-variance-authority`.
*   **`employee-modal.tsx`**: A form modal used for creating and editing employee details.
*   **`protected-route.tsx`**: A wrapper component that restricts access to authenticated users or admins.
*   **`layout.tsx`**: The main application layout, including the navigation sidebar.

### Tests and Testing Configuration
Frontend unit and component testing is set up using **Vitest** and **React Testing Library**. Tests are executed via `npm run test` (mapped to `vitest`).
*   **`src/setupTests.js`**: Setup script initialized by Vitest before tests run, usually to extend `expect` matchers with `@testing-library/jest-dom`.
*   Test files are designed to evaluate React component rendering and user interactions using a simulated DOM (`jsdom`).

### Configuration & Dependency Files
*   **`vite.config.ts`**: Configures the Vite bundler. It uses `@vitejs/plugin-react` for React support and `@tailwindcss/vite` for styling. It also establishes the test environment (`jsdom`, global variables, and pointing to `setupTests.js`) and defines absolute path aliases (`@/` -> `./src`).
*   **`tsconfig.json` & `tsconfig.node.json`**: TypeScript configuration files establishing compiler settings (e.g., target `ES2020`, isolated modules, strict type-checking, and path alias mapping).
*   **`package.json`**: Contains all NPM dependencies (React, Radix UI, Recharts, Vite, Vitest) and scripts for building, previewing, and testing the application.

---

## 5. Infrastructure Deep Dive (`/terraform`)

The project uses Terraform to provision AWS infrastructure for deployment.

*   **`main.tf`**: The primary configuration file. It provisions:
    *   An RSA SSH Key Pair (saving the `.pem` file locally to `ssh-keys/`).
    *   An AWS Security Group (`ec2_sg`) that opens ports for SSH (22), HTTP (80), HTTPS (443), FastAPI (8000), and MongoDB (27017).
    *   An EC2 Instance running Ubuntu 22.04. It includes a `user_data` script that automatically installs dependencies (Python, Node.js 18, Nginx, Git) upon booting.
*   **`variables.tf`**: Defines configurable parameters like `aws_region`, `project_name`, and `instance_type`.
*   **`outputs.tf`**: Exposes useful post-deployment information, such as the public IP, public DNS, and the exact SSH command needed to connect to the instance.

---

## Summary

This repository represents a fully functional, container-ready, cloud-deployable Employee Management System. The separation of concerns between the React frontend, the FastAPI backend, and the Terraform infrastructure makes it highly maintainable and scalable. The backend enforces strict validation and role-based access control, while the frontend provides a responsive, analytical, and user-friendly interface.