import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { ADMIN_EMAIL, db, seedIfNeeded } from "./storage";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => User | null;
  register: (name: string, email: string, password: string) => User | { error: string };
  logout: () => void;
  updateProfile: (patch: Partial<Pick<User, "name" | "email" | "password">>) => void;
  refresh: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    seedIfNeeded();
    const sid = db.getSessionId();
    if (!sid) {
      setUser(null);
    } else {
      const u = db.getUsers().find((x) => x.id === sid) || null;
      setUser(u);
    }
    setLoading(false);
  };

  useEffect(() => {
    refresh();
  }, []);

  const login = (email: string, password: string) => {
    const u = db.getUsers().find((x) => x.email.toLowerCase() === email.toLowerCase() && x.password === password);
    if (!u) return null;
    db.setSessionId(u.id);
    setUser(u);
    return u;
  };

  const register = (name: string, email: string, password: string) => {
    const users = db.getUsers();
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      return { error: "email_taken" };
    }
    const u: User = {
      id: crypto.randomUUID(),
      name,
      email,
      password,
      role: email.toLowerCase() === ADMIN_EMAIL.toLowerCase() ? "ADMIN" : "USUARIO",
    };
    db.setUsers([...users, u]);
    db.setSessionId(u.id);
    setUser(u);
    return u;
  };

  const logout = () => {
    db.setSessionId(null);
    setUser(null);
  };

  const updateProfile = (patch: Partial<Pick<User, "name" | "email" | "password">>) => {
    if (!user) return;
    const users = db.getUsers().map((u) => (u.id === user.id ? { ...u, ...patch } : u));
    db.setUsers(users);
    setUser({ ...user, ...patch });
  };

  return <Ctx.Provider value={{ user, loading, login, register, logout, updateProfile, refresh }}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
