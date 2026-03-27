import { Outlet, NavLink } from "react-router";
import { useAuth } from "../contexts/auth-context";
import { LayoutDashboard, Users, Settings, LogOut } from "lucide-react";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Button } from "./ui/button";

export function Layout() {
  const { user, logout, isAdmin } = useAuth();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <nav className="bg-white border-b border-border sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">EMS</span>
                </div>
                <span className="text-xl font-semibold text-foreground">EMS Portal</span>
              </div>

              {/* Nav Links */}
              <div className="hidden md:flex items-center gap-1">
                <NavLink
                  to="/directory"
                  className={({ isActive }) =>
                    `px-4 py-2 rounded-lg transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`
                  }
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Employees</span>
                  </div>
                </NavLink>

                {isAdmin && (
                  <>
                    <NavLink
                      to="/management"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <Settings className="w-4 h-4" />
                        <span>Management</span>
                      </div>
                    </NavLink>

                    <NavLink
                      to="/dashboard"
                      className={({ isActive }) =>
                        `px-4 py-2 rounded-lg transition-colors ${
                          isActive
                            ? "bg-accent text-accent-foreground"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        }`
                      }
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Dashboard</span>
                      </div>
                    </NavLink>
                  </>
                )}
              </div>
            </div>

            {/* User Profile */}
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-sm text-muted-foreground">Welcome back,</p>
                <p className="text-sm font-medium text-foreground">{user?.name || user?.email}</p>
              </div>
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  {user ? getInitials(user.name || user.email) : "U"}
                </AvatarFallback>
              </Avatar>
              <Button
                variant="ghost"
                size="sm"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}
