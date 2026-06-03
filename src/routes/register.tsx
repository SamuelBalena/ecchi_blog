import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/register")({
  component: RegisterPage,
});

function RegisterPage() {
  const { register } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const r = register(name, email, password);
    if ("error" in r) {
      setError(t("email_taken"));
      return;
    }
    navigate({ to: r.role === "ADMIN" ? "/admin" : "/home", replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-16 bg-background">
      <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">EcchiAcademy</p>
          <h2 className="text-3xl font-display">{t("register_title")}</h2>
        </div>
        <div className="space-y-4">
          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("name")}</span>
            <input required value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-transparent border-b border-input py-2 text-sm focus:outline-none focus:border-ring" />
          </label>
          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("email")}</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent border-b border-input py-2 text-sm focus:outline-none focus:border-ring" />
          </label>
          <label className="block">
            <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("password")}</span>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-transparent border-b border-input py-2 text-sm focus:outline-none focus:border-ring" />
          </label>
        </div>
        {error && <p className="text-xs text-destructive">{error}</p>}
        <button type="submit" className="w-full bg-foreground text-background py-3 text-[12px] font-mono uppercase tracking-widest rounded hover:opacity-85 transition-opacity">
          {t("submit")}
        </button>
        <p className="text-xs text-muted-foreground text-center">
          {t("have_account")} <Link to="/login" className="text-accent border-b border-accent/30">{t("sign_in")}</Link>
        </p>
      </form>
    </div>
  );
}
