import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/settings")({
  component: () => (
    <AuthGate>
      <SettingsPage />
    </AuthGate>
  ),
});

function SettingsPage() {
  const { user, updateProfile } = useAuth();
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch: Record<string, string> = { name, email };
    if (password) patch.password = password;
    await updateProfile(patch);
    setPassword("");
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-display mb-12">{t("settings_title")}</h1>
        <form onSubmit={onSubmit} className="space-y-6">
          <FieldText label={t("name")} value={name} onChange={setName} />
          <FieldText
            label={t("email")}
            value={email}
            onChange={setEmail}
            type="email"
          />
          <FieldText
            label={t("password")}
            value={password}
            onChange={setPassword}
            type="password"
            placeholder="••••••"
          />
          <div className="flex items-center gap-4 pt-4">
            <button
              type="submit"
              className="bg-foreground text-background px-6 py-3 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85"
            >
              {t("save")}
            </button>
            {saved && (
              <span className="text-xs font-mono text-accent uppercase tracking-widest">
                ✓ {t("saved")}
              </span>
            )}
          </div>
        </form>
      </main>
    </div>
  );
}

function FieldText({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-transparent border-b border-input py-2 text-sm focus:outline-none focus:border-ring"
      />
    </label>
  );
}
