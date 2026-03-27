import "./index.css";
import { RouterProvider } from "react-router";
import { AuthProvider } from "./contexts/auth-context";
import { EmployeeProvider } from "./contexts/employee-context";
import { Toaster } from "sonner";
import { router } from "./routes";

function App() {
  return (
    <AuthProvider>
      <EmployeeProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </EmployeeProvider>
    </AuthProvider>
  );
}

export default App;
