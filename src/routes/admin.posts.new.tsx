import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PostEditor } from "@/components/PostEditor";
import { db } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";

export const Route = createFileRoute("/admin/posts/new")({
  component: NewPost,
});

function NewPost() {
  const navigate = useNavigate();
  const { t } = useI18n();
  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground mb-8">{t("new_post")}</h2>
      <PostEditor
        onSave={(p) => { db.setPosts([...db.getPosts(), p]); navigate({ to: "/admin" }); }}
        onCancel={() => navigate({ to: "/admin" })}
      />
    </div>
  );
}
