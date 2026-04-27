import React, { createContext, useContext, useEffect, useState } from "react";
import { User, Session, getSession, login, register, logout, initStorage } from "@/lib/storage";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loginUser: typeof login;
  registerUser: typeof register;
  logoutUser: () => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initStorage();
    const currentSession = getSession();
    setSession(currentSession);
    if (currentSession) {
      const users = JSON.parse(localStorage.getItem("jat_users") || "[]") as User[];
      const currentUser = users.find((u) => u.email === currentSession.email) || null;
      setUser(currentUser);
    }
    setIsLoading(false);
  }, []);

  const loginUser = async (...args: Parameters<typeof login>) => {
    const res = await login(...args);
    setSession(res.session);
    setUser(res.user);
    return res;
  };

  const registerUser = async (...args: Parameters<typeof register>) => {
    const res = await register(...args);
    setSession(res.session);
    setUser(res.user);
    return res;
  };

  const logoutUser = () => {
    logout();
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, session, loginUser, registerUser, logoutUser, isLoading }}>
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
