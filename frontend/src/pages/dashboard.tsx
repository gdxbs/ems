import { useMemo } from "react";
import { useEmployees } from "../contexts/employee-context";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";
import { Card } from "../components/ui/card";
import { Users, TrendingUp, Activity, Building2 } from "lucide-react";

const COLORS = ["#6366F1", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"];

export function Dashboard() {
  const { employees, loading } = useEmployees();

  const departmentData = useMemo(() => {
    const departments = employees.reduce(
      (acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>
    );

    return Object.entries(departments).map(([name, value]) => ({ name, value }));
  }, [employees]);

  const activeEmployees = employees.filter(
    (e) => e.status.toLowerCase() === "active"
  ).length;
  const inactiveEmployees = employees.filter(
    (e) => e.status.toLowerCase() !== "active"
  ).length;

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-4xl font-bold text-foreground mb-2">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Overview of your employee data and department distribution
          </p>
        </div>

        {/* Stats Cards */}
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="p-6 bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total Employees</p>
                    <p className="text-2xl font-bold text-foreground">{employees.length}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                    <Activity className="w-6 h-6 text-green-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Active</p>
                    <p className="text-2xl font-bold text-foreground">{activeEmployees}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center">
                    <TrendingUp className="w-6 h-6 text-red-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Inactive</p>
                    <p className="text-2xl font-bold text-foreground">{inactiveEmployees}</p>
                  </div>
                </div>
              </Card>

              <Card className="p-6 bg-white border-border shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Departments</p>
                    <p className="text-2xl font-bold text-foreground">
                      {departmentData.length}
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* Chart Section */}
            <Card className="p-8 bg-white border-border shadow-sm">
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-2">
                    Department Distribution
                  </h2>
                  <p className="text-muted-foreground">
                    Employee breakdown across all departments
                  </p>
                </div>

                {departmentData.length > 0 ? (
                  <div className="w-full h-[500px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={departmentData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                          outerRadius={150}
                          innerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          paddingAngle={2}
                        >
                          {departmentData.map((_, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={COLORS[index % COLORS.length]}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #E2E8F0",
                            borderRadius: "8px",
                            padding: "12px",
                          }}
                        />
                        <Legend
                          verticalAlign="bottom"
                          height={36}
                          iconType="circle"
                          wrapperStyle={{ paddingTop: "20px" }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="flex justify-center items-center h-64">
                    <p className="text-muted-foreground">No employee data available.</p>
                  </div>
                )}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
