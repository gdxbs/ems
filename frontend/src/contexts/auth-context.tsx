import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import api from "../api/axios";

interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "user";
}

interface JwtPayload {
  sub?: string;
  id?: string;
  role?: string;
  name?: string;
  email?: string;
  exp?: number;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode<JwtPayload>(token);
        return {
          id: decoded.sub || decoded.id || "",
          name: decoded.name || decoded.email || "User",
          email: decoded.email || "",
          role: (decoded.role === "admin" ? "admin" : "user") as "admin" | "user",
        };
      } catch {
        localStorage.removeItem("token");
      }
    }
    return null;
  });

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post("/users/login", { 
        username: email, // Backend expects 'username', we send email
        password 
      });
      const { access_token, token, role, name, ...rest } = response.data;
      const finalToken = token || access_token;
      localStorage.setItem("token", finalToken);

      // Decode JWT for user info, fall back to response data
      let decoded: JwtPayload = {};
      try {
        decoded = jwtDecode<JwtPayload>(finalToken);
      } catch {
        // ignore decode errors
      }

      const userData: User = {
        id: decoded.sub || decoded.id || rest.id || "",
        name: name || decoded.name || decoded.email || email,
        email: decoded.email || email,
        role: (role || decoded.role || "user") === "admin" ? "admin" : "user",
      };
      setUser(userData);
      return true;
    } catch {
      return false;
    }
  };

  const register = async (
    name: string,
    email: string,
    password: string
  ): Promise<boolean> => {
    try {
      await api.post("/users/register", { 
        username: name, // Backend expects 'username', we send name
        email, 
        password 
      });
      return true;
    } catch {
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === "admin",
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
