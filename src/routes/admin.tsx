import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin")({
  component: () => (
    <AuthGate adminOnly>
      <AdminLayout />
    </AuthGate>
  ),
});

function AdminLayout() {
  const { t } = useI18n();
  const path = useRouterState({ select: (s) => s.location.pathname });

  const tabs = [
    { to: "/admin", label: t("admin_posts"), exact: true },
    { to: "/admin/collections", label: t("admin_collections") },
    { to: "/admin/users", label: t("admin_users") },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="max-w-6xl mx-auto px-6 pt-12">
        <p className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">EcchiAcademy</p>
        <h1 className="text-4xl font-display mb-8">Admin</h1>
        <div className="flex gap-6 border-b border-border">
          {tabs.map((tab) => {
            const active = tab.exact ? path === tab.to : path.startsWith(tab.to);
            return (
              <Link
                key={tab.to}
                to={tab.to}
                className={`pb-4 -mb-px text-[11px] font-mono uppercase tracking-widest transition-colors ${
                  active ? "text-accent border-b-2 border-accent" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </div>
      </div>
      <main className="max-w-6xl mx-auto px-6 py-12">
        <Outlet />
      </main>
    </div>
  );
}
