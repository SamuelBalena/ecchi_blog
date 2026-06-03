import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { db } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import { DifficultyBadge } from "@/components/PostCard";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/admin/")({
  component: AdminPostsList,
});

function AdminPostsList() {
  const { tr, t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);

  const refresh = () => setPosts(db.getPosts().sort((a, b) => b.createdAt - a.createdAt));
  useEffect(() => { refresh(); }, []);

  const onDelete = (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    db.setPosts(db.getPosts().filter((p) => p.id !== id));
    refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("admin_posts")}</h2>
        <Link to="/admin/posts/new" className="bg-foreground text-background px-4 py-2 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85">
          + {t("new_post")}
        </Link>
      </div>
      {posts.length === 0 ? (
        <p className="text-sm text-muted-foreground py-12">{t("no_posts")}</p>
      ) : (
        <div className="border-t border-border">
          {posts.map((p) => (
            <div key={p.id} className="grid grid-cols-[80px_1fr_auto] gap-6 items-center py-5 border-b border-border">
              <div className="aspect-[4/3] bg-stone-100 rounded-sm overflow-hidden">
                <img src={p.coverImage} alt="" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <DifficultyBadge d={p.difficulty} />
                </div>
                <h3 className="text-lg font-display">{tr(p.title)}</h3>
              </div>
              <div className="flex gap-3 text-[11px] font-mono uppercase tracking-widest">
                <Link to="/admin/posts/$id/edit" params={{ id: p.id }} className="text-accent hover:underline">{t("edit")}</Link>
                <button onClick={() => onDelete(p.id)} className="text-destructive hover:underline">{t("delete")}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
