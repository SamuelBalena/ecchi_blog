import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { api } from "./api-client";
import { db } from "./storage";
import type { User } from "./types";

interface AuthCtx {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<User | null>;
  register: (
    name: string,
    email: string,
    password: string,
  ) => Promise<User | { error: string }>;
  logout: () => void;
  updateProfile: (
    patch: Partial<Pick<User, "name" | "email" | "password">>,
  ) => Promise<void>;
  refresh: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const sid = db.getSessionId();
    if (!sid) {
      setUser(null);
    } else {
      try {
        const users = await api.users.list();
        setUser(users.find((x) => x.id === sid) || null);
      } catch {
        setUser(null);
        db.setSessionId(null);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    void refresh();
  }, []);

  const login = async (email: string, password: string) => {
    const users = await api.users.list();
    const u = users.find(
      (x) =>
        x.email.toLowerCase() === email.toLowerCase() &&
        (!x.password || x.password === password),
    );
    if (!u) return null;
    db.setSessionId(u.id);
    setUser(u);
    return u;
  };

  const register = async (name: string, email: string, password: string) => {
    const users = await api.users.list();
    if (users.some((x) => x.email.toLowerCase() === email.toLowerCase())) {
      return { error: "email_taken" };
    }
    const created = await api.users.create({
      id: "",
      name,
      email,
      password,
      role: "USUARIO",
    });
    const u = created.id ? created : { ...created, id: crypto.randomUUID() };
    db.setSessionId(u.id);
    setUser(u);
    return u;
  };

  const logout = () => {
    db.setSessionId(null);
    setUser(null);
  };

  const updateProfile = async (
    patch: Partial<Pick<User, "name" | "email" | "password">>,
  ) => {
    if (!user) return;
    const updated = await api.users.update({ ...user, ...patch });
    setUser(updated);
  };

  return (
    <Ctx.Provider
      value={{ user, loading, login, register, logout, updateProfile, refresh }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
