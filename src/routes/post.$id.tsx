import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AuthGate } from "@/components/AuthGate";
import { Navbar } from "@/components/Navbar";
import { DifficultyBadge } from "@/components/PostCard";
import { api } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import type { Collection, Post, RichContent } from "@/lib/types";

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
    void api.posts
      .get(id)
      .then(async (p) => {
        setPost(p);
        if (p.collectionId) {
          const collections = await api.collections.list();
          setCollection(
            collections.find((c) => c.id === p.collectionId) || null,
          );
        }
      })
      .catch(() => setPost(null));
  }, [id]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <p className="text-muted-foreground">Post not found.</p>
          <Link
            to="/home"
            className="text-accent text-xs font-mono uppercase tracking-widest mt-4 inline-block"
          >
            ← {t("back")}
          </Link>
        </div>
      </div>
    );
  }

  const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  const content = tr(post.content);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <article className="max-w-3xl mx-auto px-6 py-16">
        <Link
          to="/home"
          className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-accent"
        >
          ← {t("back")}
        </Link>
        <div className="mt-8 flex items-center gap-3 mb-6">
          <DifficultyBadge d={post.difficulty} />
          {collection && (
            <Link
              to="/collections/$slug"
              params={{ slug: collection.slug }}
              className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground hover:text-accent"
            >
              {tr(collection.name)}
            </Link>
          )}
          <span className="text-[11px] font-mono text-muted-foreground ml-auto">
            {date}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-display leading-tight text-balance mb-10">
          {tr(post.title)}
        </h1>
        <div className="aspect-[16/9] bg-stone-100 rounded-sm overflow-hidden mb-12">
          <img
            src={post.coverImage}
            alt={tr(post.title)}
            className="w-full h-full object-cover"
          />
        </div>
        <PostContent content={content} />
      </article>
    </div>
  );
}

function PostContent({ content }: { content: RichContent }) {
  if (typeof content === "string") {
    const blocks = content.split(/\n\n+/);

    return (
      <div className="prose-content space-y-6 text-[17px] leading-relaxed text-foreground/90">
        {blocks.map((block, i) => {
          const imgMatch = block.match(/^!\[(.*?)\]\((.+)\)$/);
          if (imgMatch) {
            return (
              <PostImage key={i} src={imgMatch[2]} caption={imgMatch[1]} />
            );
          }
          return (
            <p key={i} className="whitespace-pre-wrap">
              {block}
            </p>
          );
        })}
      </div>
    );
  }

  return (
    <div className="prose-content space-y-6 text-[17px] leading-relaxed text-foreground/90">
      {content.blocks.map((block) => {
        const data = block.data as Record<string, unknown>;
        const key = block.id;

        if (block.type === "header") {
          const text = inlineHtml(data.text);
          const level = Number(data.level);
          if (level === 3) {
            return (
              <h3
                key={key}
                className="pt-4 text-2xl font-display leading-tight"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            );
          }
          if (level === 4) {
            return (
              <h4
                key={key}
                className="pt-3 text-xl font-display leading-tight"
                dangerouslySetInnerHTML={{ __html: text }}
              />
            );
          }
          return (
            <h2
              key={key}
              className="pt-6 text-3xl font-display leading-tight"
              dangerouslySetInnerHTML={{ __html: text }}
            />
          );
        }

        if (block.type === "image") {
          const file = data.file as { url?: unknown } | undefined;
          const src =
            typeof file?.url === "string"
              ? file.url
              : typeof data.url === "string"
                ? data.url
                : "";
          return (
            <PostImage
              key={key}
              src={src}
              caption={typeof data.caption === "string" ? data.caption : ""}
            />
          );
        }

        if (block.type === "list") {
          const style = data.style === "ordered" ? "ordered" : "unordered";
          const items = normalizeListItems(data.items);
          const ListTag = style === "ordered" ? "ol" : "ul";
          return (
            <ListTag
              key={key}
              className={
                style === "ordered"
                  ? "list-decimal space-y-2 pl-6"
                  : "list-disc space-y-2 pl-6"
              }
            >
              {items.map((item, index) => (
                <li
                  key={`${key}-${index}`}
                  dangerouslySetInnerHTML={{ __html: inlineHtml(item) }}
                />
              ))}
            </ListTag>
          );
        }

        if (block.type === "checklist") {
          const items = normalizeChecklistItems(data.items);
          return (
            <ul key={key} className="space-y-3">
              {items.map((item, index) => (
                <li key={`${key}-${index}`} className="flex gap-3">
                  <span className="mt-1 grid h-4 w-4 shrink-0 place-items-center rounded-sm border border-border text-[10px]">
                    {item.checked ? "✓" : ""}
                  </span>
                  <span
                    dangerouslySetInnerHTML={{
                      __html: inlineHtml(item.text),
                    }}
                  />
                </li>
              ))}
            </ul>
          );
        }

        if (block.type === "quote") {
          return (
            <blockquote
              key={key}
              className="border-l-2 border-accent pl-5 text-xl font-display leading-relaxed text-foreground"
            >
              <p
                dangerouslySetInnerHTML={{
                  __html: inlineHtml(data.text),
                }}
              />
              {typeof data.caption === "string" && data.caption && (
                <footer
                  className="mt-3 text-xs font-mono uppercase tracking-widest text-muted-foreground"
                  dangerouslySetInnerHTML={{
                    __html: inlineHtml(data.caption),
                  }}
                />
              )}
            </blockquote>
          );
        }

        if (block.type === "delimiter") {
          return <hr key={key} className="my-10 border-border" />;
        }

        return (
          <p
            key={key}
            className="whitespace-pre-wrap"
            dangerouslySetInnerHTML={{
              __html: inlineHtml(data.text),
            }}
          />
        );
      })}
    </div>
  );
}

function PostImage({ src, caption }: { src: string; caption?: string }) {
  if (!src) return null;

  return (
    <figure className="my-8">
      <img src={src} alt={caption ?? ""} className="w-full rounded-sm" />
      {caption && (
        <figcaption
          className="mt-2 text-xs font-mono text-muted-foreground"
          dangerouslySetInnerHTML={{ __html: inlineHtml(caption) }}
        />
      )}
    </figure>
  );
}

function inlineHtml(value: unknown) {
  if (typeof value !== "string") return "";
  return value
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/\son\w+="[^"]*"/gi, "")
    .replace(/\son\w+='[^']*'/gi, "")
    .replace(/javascript:/gi, "");
}

function normalizeListItems(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "content" in item) {
        return String(item.content);
      }
      return "";
    })
    .filter(Boolean);
}

function normalizeChecklistItems(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const record = item as { text?: unknown; checked?: unknown };
      return {
        text: typeof record.text === "string" ? record.text : "",
        checked: Boolean(record.checked),
      };
    })
    .filter((item): item is { text: string; checked: boolean } =>
      Boolean(item),
    );
}
