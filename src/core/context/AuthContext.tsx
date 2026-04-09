import React, { createContext, useContext, useState, useEffect } from "react";
import { getAccessToken } from "../api/auth";

export interface User {
  id: number;
  username: string;
  is_superuser: boolean;
  name?: string;
  phone_number?: string;
  role?: string;
  has_active_shift?: boolean;
  is_mobile_user?: boolean;
  can_view_quantity?: boolean;
  store_read?: {
    name: string;
    address: string;
  };
}

interface AuthContextType {
  currentUser: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

// Create a context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);

  // Initialize auth state
  useEffect(() => {
    console.log("[AuthContext] Initializing auth state");
    const token = getAccessToken();
    const storedUser = localStorage.getItem("current_user");
    
    if (token && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setCurrentUser(userData);
        console.log("[AuthContext] Auth initialized with user:", userData.username);
      } catch (error) {
        console.error("[AuthContext] Error parsing stored user:", error);
        localStorage.removeItem("current_user");
      }
    }
    
    setIsLoading(false);
    setIsInitialized(true);
  }, []);

  // Login function - set token and user
  const login = (token: string, user: User): void => {
    console.log("[AuthContext] Login called, setting token and user");
    localStorage.setItem("access_token", token);
    localStorage.setItem("current_user", JSON.stringify(user));
    setCurrentUser(user);
  };

  // Logout function - clear token and user
  const logout = (): void => {
    console.log("[AuthContext] Logout called, clearing auth data");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("current_user");
    setCurrentUser(null);
  };

  // Calculate authentication status
  const isAuthenticated = !!currentUser;

  // Provide auth context value
  const value = {
    currentUser,
    isLoading,
    isAuthenticated,
    login,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {isInitialized ? children : <div>Initializing application...</div>}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
