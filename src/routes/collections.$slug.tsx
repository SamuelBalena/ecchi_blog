import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { api } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Collection, Post } from "@/lib/types";

export const Route = createFileRoute("/collections/$slug")({
  component: () => (
    <AuthGate>
      <CollectionDetail />
    </AuthGate>
  ),
});

function CollectionDetail() {
  const { slug } = Route.useParams();
  const { tr, t } = useI18n();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    void Promise.all([api.collections.list(), api.posts.list()]).then(
      ([collectionItems, postItems]) => {
        const c = collectionItems.find((x) => x.slug === slug) || null;
        setCollection(c);
        setPosts(c ? postItems.filter((p) => p.collectionId === c.id) : []);
      },
    );
  }, [slug]);

  if (!collection) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-6xl mx-auto px-6 py-32 text-center">
          <p className="text-muted-foreground">Collection not found.</p>
          <Link
            to="/collections"
            className="text-accent text-xs font-mono uppercase tracking-widest mt-4 inline-block"
          >
            ← {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <Link
          to="/collections"
          className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          ← {t("collections")}
        </Link>
        <h1 className="text-5xl font-display mt-4 mb-12">
          {tr(collection.name)}
        </h1>
        {posts.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("no_posts")}</p>
        ) : (
          <div className="grid gap-12">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
