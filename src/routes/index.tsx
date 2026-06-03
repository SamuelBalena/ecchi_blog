import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login", replace: true });
    else if (user.role === "ADMIN") navigate({ to: "/admin", replace: true });
    else navigate({ to: "/home", replace: true });
  }, [user, loading, navigate]);

  return (
    <div className="min-h-screen grid place-items-center text-xs font-mono text-muted-foreground uppercase tracking-widest">
      EcchiAcademy
    </div>
  );
}
