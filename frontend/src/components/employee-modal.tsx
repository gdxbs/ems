import { useState, useEffect } from "react";
import { useEmployees, Employee } from "../contexts/employee-context";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { X } from "lucide-react";

interface EmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee | null;
}

const DEPARTMENTS = [
  "Engineering",
  "Marketing",
  "Sales",
  "HR",
  "Finance",
  "Design",
  "Operations",
  "Legal",
];

const DEFAULT_FORM = {
  employee_id: "",
  name: "",
  email: "",
  department: "",
  position: "",
  salary: 0,
  status: "active",
};

export function EmployeeModal({ isOpen, onClose, employee }: EmployeeModalProps) {
  const { addEmployee, updateEmployee } = useEmployees();
  const [formData, setFormData] = useState(DEFAULT_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (employee) {
      setFormData({
        employee_id: employee.employee_id || "",
        name: employee.name,
        email: employee.email,
        department: employee.department,
        position: employee.position,
        salary: employee.salary || 0,
        status: employee.status || "active",
      });
    } else {
      setFormData(DEFAULT_FORM);
    }
  }, [employee, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (employee) {
        await updateEmployee(employee.id, { ...formData, salary: Number(formData.salary) });
      } else {
        await addEmployee({ ...formData, salary: Number(formData.salary) });
      }
      onClose();
    } catch {
      // Errors are handled by the context (toast)
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[520px] bg-white/95 backdrop-blur-xl border-border shadow-2xl">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="text-2xl font-bold text-foreground">
              {employee ? "Edit Employee" : "Add New Employee"}
            </DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 rounded-full"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee ID</Label>
              <Input
                id="employee_id"
                value={formData.employee_id}
                onChange={(e) => handleChange("employee_id", e.target.value)}
                required
                placeholder="EMP001"
                className="h-11 bg-white border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="salary">Salary ($)</Label>
              <Input
                id="salary"
                type="number"
                min="0"
                step="1000"
                value={formData.salary}
                onChange={(e) => handleChange("salary", e.target.value)}
                required
                placeholder="50000"
                className="h-11 bg-white border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              required
              placeholder="John Doe"
              className="h-11 bg-white border-border"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              required
              placeholder="john.doe@company.com"
              className="h-11 bg-white border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Select
                value={formData.department}
                onValueChange={(value) => handleChange("department", value)}
              >
                <SelectTrigger className="h-11 bg-white border-border">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
              >
                <SelectTrigger className="h-11 bg-white border-border">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">Position / Job Title</Label>
            <Input
              id="position"
              value={formData.position}
              onChange={(e) => handleChange("position", e.target.value)}
              required
              placeholder="Senior Developer"
              className="h-11 bg-white border-border"
            />
          </div>

          <div className="flex items-center gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 h-11"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1 h-11" disabled={loading}>
              {loading ? "Saving..." : employee ? "Save Changes" : "Add Employee"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
