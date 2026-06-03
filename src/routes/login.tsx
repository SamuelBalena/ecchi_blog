import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const { login } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const u = login(email, password);
    if (!u) {
      setError(t("invalid_login"));
      return;
    }
    navigate({ to: u.role === "ADMIN" ? "/admin" : "/home", replace: true });
  };

  return (
    <div className="min-h-screen bg-background grid lg:grid-cols-2">
      <div className="hidden lg:flex flex-col justify-between p-12 bg-foreground text-background">
        <h1 className="text-2xl font-display italic font-bold">EcchiAcademy</h1>
        <div>
          <p className="font-display text-4xl leading-tight mb-4 text-balance">
            A quiet space for <span className="italic">manga</span> scholarship.
          </p>
          <p className="text-xs font-mono uppercase tracking-widest opacity-60">© 2026 EA Research Studio</p>
        </div>
      </div>
      <div className="flex items-center justify-center px-6 py-16">
        <form onSubmit={onSubmit} className="w-full max-w-sm space-y-6">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
              Ecchi Academy
            </p>
            <h2 className="text-3xl font-display">{t("login_title")}</h2>
          </div>
          <div className="space-y-4">
            <Field label={t("email")}>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input"
              />
            </Field>
            <Field label={t("password")}>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input"
              />
            </Field>
          </div>
          {error && <p className="text-xs text-destructive">{error}</p>}
          <button type="submit" className="btn-primary w-full">
            {t("sign_in")}
          </button>
          <p className="text-xs text-muted-foreground text-center">
            {t("no_account")}{" "}
            <Link to="/register" className="text-accent border-b border-accent/30">
              {t("create_one")}
            </Link>
          </p>
          <p className="text-[10px] font-mono text-muted-foreground/60 text-center pt-4 border-t border-border">
            Admin demo: admin@ecchiacademy.com / admin123
            <br />
            User demo: user@ecchiacademy.com / user123
          </p>
        </form>
      </div>
      <style>{`
        .input { width: 100%; background: transparent; border: none; border-bottom: 1px solid var(--input); padding: 8px 0; font-size: 14px; outline: none; transition: border-color .2s; }
        .input:focus { border-color: var(--ring); }
        .btn-primary { background: var(--foreground); color: var(--background); padding: 12px 16px; font-size: 12px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.15em; border-radius: 4px; transition: opacity .2s; }
        .btn-primary:hover { opacity: 0.85; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
