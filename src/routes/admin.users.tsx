import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import type { Role, User } from "@/lib/types";

export const Route = createFileRoute("/admin/users")({
  component: AdminUsers,
});

function emptyUser(): User {
  return { id: crypto.randomUUID(), name: "", email: "", password: "", role: "USUARIO" };
}

function AdminUsers() {
  const { t } = useI18n();
  const [users, setUsers] = useState<User[]>([]);
  const [editing, setEditing] = useState<User | null>(null);

  const refresh = () => setUsers(db.getUsers());
  useEffect(() => { refresh(); }, []);

  const save = (u: User) => {
    if (!u.email || !u.name) return;
    const exists = db.getUsers().some((x) => x.id === u.id);
    if (!exists && db.getUsers().some((x) => x.email.toLowerCase() === u.email.toLowerCase())) {
      alert(t("email_taken"));
      return;
    }
    db.setUsers(exists ? db.getUsers().map((x) => x.id === u.id ? u : x) : [...db.getUsers(), u]);
    setEditing(null);
    refresh();
  };

  const del = (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    db.setUsers(db.getUsers().filter((u) => u.id !== id));
    refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("admin_users")}</h2>
        <button onClick={() => setEditing(emptyUser())} className="bg-foreground text-background px-4 py-2 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85">
          + {t("new_user")}
        </button>
      </div>

      <div className="border-t border-border">
        {users.map((u) => (
          <div key={u.id} className="grid grid-cols-[1fr_auto_auto] gap-6 items-center py-4 border-b border-border">
            <div>
              <p className="font-display text-lg">{u.name}</p>
              <p className="text-[11px] font-mono text-muted-foreground">{u.email}</p>
            </div>
            <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-full ${u.role === "ADMIN" ? "bg-foreground text-background" : "border border-border text-muted-foreground"}`}>
              {u.role}
            </span>
            <div className="flex gap-3 text-[11px] font-mono uppercase tracking-widest">
              <button onClick={() => setEditing(u)} className="text-accent hover:underline">{t("edit")}</button>
              <button onClick={() => del(u.id)} className="text-destructive hover:underline">{t("delete")}</button>
            </div>
          </div>
        ))}
      </div>

      {editing && <UserForm user={editing} onSave={save} onCancel={() => setEditing(null)} />}
    </div>
  );
}

function UserForm({ user, onSave, onCancel }: { user: User; onSave: (u: User) => void; onCancel: () => void }) {
  const { t } = useI18n();
  const [u, setU] = useState(user);

  return (
    <div className="fixed inset-0 bg-foreground/40 grid place-items-center z-50 p-6" onClick={onCancel}>
      <div className="bg-background w-full max-w-md p-8 rounded-sm" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-2xl font-display mb-6">{user.email ? t("edit") : t("new_user")}</h3>
        <form onSubmit={(e) => { e.preventDefault(); onSave(u); }} className="space-y-4">
          <F label={t("name")}><input required value={u.name} onChange={(e) => setU({ ...u, name: e.target.value })} className="inp" /></F>
          <F label={t("email")}><input required type="email" value={u.email} onChange={(e) => setU({ ...u, email: e.target.value })} className="inp" /></F>
          <F label={t("password")}><input required={!user.password} type="password" value={u.password} onChange={(e) => setU({ ...u, password: e.target.value })} className="inp" placeholder={user.password ? "(unchanged)" : ""} /></F>
          <F label={t("role")}>
            <select value={u.role} onChange={(e) => setU({ ...u, role: e.target.value as Role })} className="inp">
              <option value="USUARIO">USUARIO</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </F>
          <div className="flex gap-3 pt-4">
            <button type="submit" className="bg-foreground text-background px-6 py-3 text-[11px] font-mono uppercase tracking-widest rounded">{t("save")}</button>
            <button type="button" onClick={onCancel} className="px-6 py-3 text-[11px] font-mono uppercase tracking-widest border border-border rounded">{t("cancel")}</button>
          </div>
        </form>
        <style>{`.inp{width:100%;background:transparent;border:none;border-bottom:1px solid var(--input);padding:8px 0;font-size:14px;outline:none}.inp:focus{border-color:var(--ring)}`}</style>
      </div>
    </div>
  );
}

function F({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{label}</span>
      {children}
    </label>
  );
}
