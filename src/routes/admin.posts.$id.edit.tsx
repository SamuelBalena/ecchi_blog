import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PostEditor } from "@/components/PostEditor";
import { api } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Post } from "@/lib/types";

export const Route = createFileRoute("/admin/posts/$id/edit")({
  component: EditPost,
});

function EditPost() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { t } = useI18n();
  const [post, setPost] = useState<Post | null>(null);

  useEffect(() => {
    void api.posts
      .get(id)
      .then(setPost)
      .catch(() => setPost(null));
  }, [id]);

  if (!post) return <p className="text-sm text-muted-foreground">…</p>;

  return (
    <div>
      <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground mb-8">
        {t("edit")}
      </h2>
      <PostEditor
        initial={post}
        onSave={async (p) => {
          await api.posts.update(p);
          navigate({ to: "/admin" });
        }}
        onCancel={() => navigate({ to: "/admin" })}
      />
    </div>
  );
}
