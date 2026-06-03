import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/PostCard";
import { db } from "@/lib/storage";
import { useI18n } from "@/lib/i18n";
import type { Collection, Post } from "@/lib/types";

export const Route = createFileRoute("/post/$id")({
  component: () => (
    <AuthGate>
      <PostDetail />
    </AuthGate>
  ),
});

function PostDetail() {
  const { id } = Route.useParams();
  const { tr, t } = useI18n();
  const [post, setPost] = useState<Post | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);

  useEffect(() => {
    const p = db.getPosts().find((x) => x.id === id) || null;
    setPost(p);
    if (p?.collectionId) {
      setCollection(db.getCollections().find((c) => c.id === p.collectionId) || null);
    }
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link to="/home" className="text-accent text-xs font-mono uppercase tracking-widest mt-4 inline-block">
            ← {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit", month: "long", year: "numeric",
  });

  // Render markdown-ish: ![](url) become images, double newlines paragraphs
  const content = tr(post.content);
  const blocks = content.split(/\n\n+/);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link to="/home" className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-accent">
          ← {t("back")}
        </Link>
        <div className="mt-8 flex items-center gap-3 mb-6">
          <DifficultyBadge d={post.difficulty} />
          {collection && (
            <Link to="/collections/$slug" params={{ slug: collection.slug }} className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-accent">
              {tr(collection.name)}
            </Link>
          )}
          <span className="text-[11px] font-mono text-muted-foreground ml-auto">{date}</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display leading-tight text-balance mb-10">
          {tr(post.title)}
        </h1>
        <div className="aspect-[16/9] bg-stone-100 rounded-sm overflow-hidden mb-12">
          <img src={post.coverImage} alt={tr(post.title)} className="w-full h-full object-cover" />
        </div>
        <div className="prose-content space-y-6 text-[17px] leading-relaxed text-foreground/90">
          {blocks.map((block, i) => {
            const imgMatch = block.match(/^!\[(.*?)\]\((.+)\)$/);
            if (imgMatch) {
              return (
                <figure key={i} className="my-8">
                  <img src={imgMatch[2]} alt={imgMatch[1]} className="w-full rounded-sm" />
                  {imgMatch[1] && <figcaption className="text-xs text-muted-foreground mt-2 font-mono">{imgMatch[1]}</figcaption>}
                </figure>
              );
            }
            return <p key={i} className="whitespace-pre-wrap">{block}</p>;
          })}
        </div>
      </article>
    </div>
  );
}
