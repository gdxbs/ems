import { createBrowserRouter } from "react-router";
import { Login } from "./pages/login";
import { Register } from "./pages/register";
import { Dashboard } from "./pages/dashboard";
import { EmployeeDirectory } from "./pages/employee-directory";
import { EmployeeManagement } from "./pages/employee-management";
import { Layout } from "./components/layout";
import { ProtectedRoute } from "./components/protected-route";

export const router = createBrowserRouter([
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/register",
    Component: Register,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        Component: EmployeeDirectory,
      },
      {
        path: "directory",
        Component: EmployeeDirectory,
      },
      {
        path: "management",
        element: (
          <ProtectedRoute requireAdmin>
            <EmployeeManagement />
          </ProtectedRoute>
        ),
      },
      {
        path: "dashboard",
        element: (
          <ProtectedRoute requireAdmin>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
    ],
  },
]);
