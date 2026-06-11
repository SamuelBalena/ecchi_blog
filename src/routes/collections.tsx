import {
  createFileRoute,
  Link,
  Outlet,
  useRouterState,
} from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { api } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Collection, Post } from "@/lib/types";

export const Route = createFileRoute("/collections")({
  component: () => (
    <AuthGate>
      <CollectionsRoute />
    </AuthGate>
  ),
});

function CollectionsRoute() {
  const isCollectionsIndex = useRouterState({
    select: (state) =>
      state.location.pathname.replace(/\/$/, "") === "/collections",
  });

  return isCollectionsIndex ? <CollectionsPage /> : <Outlet />;
}

function CollectionsPage() {
  const { tr, t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    void Promise.all([api.collections.list(), api.posts.list()]).then(
      ([collectionItems, postItems]) => {
        setCollections(collectionItems);
        setPosts(postItems);
      },
    );
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6 py-16">
        <h1 className="text-5xl font-display mb-12">{t("collections")}</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {collections.map((c) => {
            const count = posts.filter((p) => p.collectionId === c.id).length;
            return (
              <Link
                key={c.id}
                to="/collections/$slug"
                params={{ slug: c.slug }}
                className="group block"
              >
                <div className="aspect-[4/5] bg-stone-100 outline outline-1 -outline-offset-1 outline-black/5 rounded-sm overflow-hidden mb-4">
                  <img
                    src={c.coverImage}
                    alt={tr(c.name)}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  />
                </div>
                <h3 className="text-xl font-display group-hover:text-accent transition-colors">
                  {tr(c.name)}
                </h3>
                <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground mt-1">
                  {count} {count === 1 ? "post" : "posts"}
                </p>
              </Link>
            );
          })}
        </div>
      </main>
    </div>
  );
}
