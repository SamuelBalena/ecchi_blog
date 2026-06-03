import { useEffect, type ReactNode } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";

export function AuthGate({ children, adminOnly = false }: { children: ReactNode; adminOnly?: boolean }) {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate({ to: "/login" });
    } else if (adminOnly && user.role !== "ADMIN") {
      navigate({ to: "/home" });
    }
  }, [user, loading, adminOnly, navigate]);

  if (loading || !user || (adminOnly && user.role !== "ADMIN")) {
    return (
      <div className="min-h-screen grid place-items-center text-xs font-mono text-muted-foreground uppercase tracking-widest">
        Loading...
      </div>
    );
  }
  return <>{children}</>;
}
