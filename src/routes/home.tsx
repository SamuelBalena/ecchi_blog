import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { PostCard } from "@/components/PostCard";
import { CollectionsCarousel } from "@/components/CollectionsCarousel";
import { db } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import type { Collection, Post } from "@/lib/types";

export const Route = createFileRoute("/home")({
  component: () => (
    <AuthGate>
      <HomePage />
    </AuthGate>
  ),
});

function HomePage() {
  const { t } = useI18n();
  const [posts, setPosts] = useState<Post[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    setPosts(db.getPosts().sort((a, b) => b.createdAt - a.createdAt));
    setCollections(db.getCollections());
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-accent/10 selection:text-accent">
      <Navbar />
      <main className="max-w-6xl mx-auto px-6">
        <section className="py-24 md:py-32 animate-reveal">
          <div className="max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-display leading-[1.1] text-balance mb-8">
              {t("hero_title_pre")} <span className="italic">{t("hero_title_em")}</span>
              {t("hero_title_post")}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed text-pretty max-w-lg">
              {t("hero_subtitle")}
            </p>
          </div>
        </section>

        <section className="pb-24 animate-reveal" style={{ animationDelay: "150ms" }}>
          <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
            <h2 className="text-sm font-mono uppercase tracking-[0.2em] font-medium">{t("latest_posts")}</h2>
          </div>
          {posts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12">{t("no_posts")}</p>
          ) : (
            <div className="grid gap-12">
              {posts.slice(0, 5).map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          )}
        </section>

        {collections.length > 0 && <CollectionsCarousel collections={collections} />}
      </main>
      <Footer />
    </div>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <div className="max-w-6xl mx-auto px-6 flex justify-between items-center text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
        <p className="italic font-display normal-case text-sm not-italic font-bold">EcchiAcademy</p>
        <p>© 2026 EA Research Studio</p>
      </div>
    </footer>
  );
}
