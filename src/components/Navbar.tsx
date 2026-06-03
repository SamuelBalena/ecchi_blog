import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth-context";
import { useI18n } from "@/lib/i18n";
import type { Lang } from "@/lib/types";

export function Navbar() {
  const { user, logout } = useAuth();
  const { lang, setLang, t } = useI18n();
  const navigate = useNavigate();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const isAdmin = user?.role === "ADMIN";

  const tabs = isAdmin
    ? [
        { to: "/admin", label: t("nav_admin") },
        { to: "/home", label: t("nav_home") },
      ]
    : [
        { to: "/home", label: t("nav_home") },
        { to: "/collections", label: t("nav_collections") },
        { to: "/settings", label: t("nav_settings") },
      ];

  const langs: Lang[] = ["en", "jp", "pt"];

  return (
    <nav className="sticky top-0 z-50 bg-background/85 backdrop-blur-md border-b border-border">
      <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
        <div className="flex items-center gap-10">
          <Link to="/home" className="text-xl font-display italic font-bold tracking-tight">
            EcchiAcademy
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {tabs.map((tab) => {
              const active = path === tab.to || (tab.to === "/admin" && path.startsWith("/admin"));
              return (
                <Link
                  key={tab.to}
                  to={tab.to}
                  className={`text-[13px] font-medium tracking-wide uppercase transition-colors ${
                    active ? "text-foreground" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </Link>
              );
            })}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-[11px] font-mono font-medium">
            {langs.map((l) => (
              <button
                key={l}
                onClick={() => setLang(l)}
                className={`px-2 py-1 rounded transition-colors ${
                  lang === l
                    ? "text-accent border border-accent/30"
                    : "text-muted-foreground hover:text-foreground border border-transparent"
                }`}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
          {user ? (
            <button
              onClick={() => {
                logout();
                navigate({ to: "/login" });
              }}
              className="text-[11px] font-mono uppercase tracking-wider text-muted-foreground hover:text-accent transition-colors ml-2"
            >
              {t("nav_logout")}
            </button>
          ) : (
            <Link to="/login" className="text-[11px] font-mono uppercase tracking-wider text-accent">
              {t("nav_login")}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
