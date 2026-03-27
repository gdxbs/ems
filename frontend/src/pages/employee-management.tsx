import { useState, useMemo } from "react";
import { useEmployees, Employee } from "../contexts/employee-context";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Button } from "../components/ui/button";
import { Search, Plus, Pencil, Trash2 } from "lucide-react";
import { Card } from "../components/ui/card";
import { EmployeeModal } from "../components/employee-modal";

export function EmployeeManagement() {
  const { employees, loading, deleteEmployee } = useEmployees();
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);

  const departments = useMemo(() => {
    const depts = new Set(employees.map((e) => e.department));
    return Array.from(depts).sort();
  }, [employees]);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const matchesSearch =
        employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        employee.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;
      return matchesSearch && matchesDepartment;
    });
  }, [employees, searchTerm, departmentFilter]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  const isActive = (status: string) => status.toLowerCase() === "active";

  const handleAddEmployee = () => {
    setEditingEmployee(null);
    setIsModalOpen(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    setEditingEmployee(employee);
    setIsModalOpen(true);
  };

  const handleDeleteEmployee = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this employee?")) {
      await deleteEmployee(id);
    }
  };

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">
              Employee Management
            </h1>
            <p className="text-muted-foreground">
              Add, edit, and manage employee records
            </p>
          </div>
          <Button
            size="lg"
            onClick={handleAddEmployee}
            className="gap-2 shadow-lg hover:shadow-xl transition-shadow"
          >
            <Plus className="w-5 h-5" />
            Add Employee
          </Button>
        </div>

        {/* Filters */}
        <Card className="p-6 bg-white border-border shadow-sm">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 bg-white border-border"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger className="w-full md:w-[240px] h-12 bg-white border-border">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map((dept) => (
                  <SelectItem key={dept} value={dept}>
                    {dept}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Results Count */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredEmployees.length} of {employees.length} employees
        </div>

        {/* Employee Table */}
        <Card className="bg-white border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Employee
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Email
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Department
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Position
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-foreground">
                      Status
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-foreground">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredEmployees.map((employee) => (
                    <tr
                      key={employee.id}
                      className="hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback className="bg-primary/10 text-primary">
                              {getInitials(employee.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <span className="font-medium text-foreground block">
                              {employee.name}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {employee.employee_id}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{employee.email}</td>
                      <td className="px-6 py-4">
                        <Badge
                          variant="secondary"
                          className="bg-secondary text-secondary-foreground"
                        >
                          {employee.department}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{employee.position}</td>
                      <td className="px-6 py-4">
                        {isActive(employee.status) ? (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500" />
                            <span className="text-sm text-green-700 font-medium">Active</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-400" />
                            <span className="text-sm text-gray-600 font-medium">Inactive</span>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditEmployee(employee)}
                            className="text-primary hover:text-primary hover:bg-primary/10"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteEmployee(employee.id)}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredEmployees.length === 0 && !loading && (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No employees found matching your criteria.
                  </p>
                </div>
              )}
            </div>
          )}
        </Card>
      </div>

      <EmployeeModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        employee={editingEmployee}
      />
    </div>
  );
}
