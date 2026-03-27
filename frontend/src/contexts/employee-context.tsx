import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { toast } from "sonner";
import api from "../api/axios";
import { useAuth } from "./auth-context";

export interface Employee {
  id: string;
  employee_id: string;
  name: string;
  email: string;
  department: string;
  position: string;
  salary: number;
  status: string;
}

type EmployeeInput = Omit<Employee, "id">;

interface EmployeeContextType {
  employees: Employee[];
  loading: boolean;
  fetchEmployees: (name?: string, department?: string) => Promise<void>;
  addEmployee: (employee: EmployeeInput) => Promise<void>;
  updateEmployee: (id: string, employee: EmployeeInput) => Promise<void>;
  deleteEmployee: (id: string) => Promise<void>;
}

const EmployeeContext = createContext<EmployeeContextType | undefined>(undefined);

/** Normalize a raw API response employee to our Employee shape */
function normalize(raw: Record<string, unknown>): Employee {
  return {
    id: (raw._id || raw.id || raw.employee_id || "") as string,
    employee_id: (raw.employee_id || raw._id || "") as string,
    name: (raw.name || "") as string,
    email: (raw.email || "") as string,
    department: (raw.department || "") as string,
    position: (raw.position || "") as string,
    salary: Number(raw.salary || 0),
    status: (raw.status || "active") as string,
  };
}

export function EmployeeProvider({ children }: { children: ReactNode }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchEmployees = async (name?: string, department?: string) => {
    setLoading(true);
    try {
      const query = new URLSearchParams();
      if (name) query.append("name", name);
      if (department) query.append("department", department);

      const endpoint =
        name || department
          ? `/employees/search?${query.toString()}`
          : "/employees";
      const response = await api.get(endpoint);
      const data: Employee[] = (response.data as Record<string, unknown>[]).map(normalize);
      setEmployees(data);
    } catch {
      toast.error("Failed to fetch employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchEmployees();
    }
  }, [isAuthenticated]);

  const addEmployee = async (employee: EmployeeInput) => {
    try {
      await api.post("/employees", employee);
      toast.success("Employee added successfully");
      await fetchEmployees();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Failed to add employee");
      throw err;
    }
  };

  const updateEmployee = async (id: string, employee: EmployeeInput) => {
    try {
      await api.put(`/employees/${id}`, employee);
      toast.success("Employee updated successfully");
      await fetchEmployees();
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      toast.error(detail || "Failed to update employee");
      throw err;
    }
  };

  const deleteEmployee = async (id: string) => {
    try {
      await api.delete(`/employees/${id}`);
      toast.success("Employee deleted successfully");
      await fetchEmployees();
    } catch {
      toast.error("Failed to delete employee");
    }
  };

  return (
    <EmployeeContext.Provider
      value={{
        employees,
        loading,
        fetchEmployees,
        addEmployee,
        updateEmployee,
        deleteEmployee,
      }}
    >
      {children}
    </EmployeeContext.Provider>
  );
}

export function useEmployees() {
  const context = useContext(EmployeeContext);
  if (context === undefined) {
    throw new Error("useEmployees must be used within an EmployeeProvider");
  }
  return context;
}
