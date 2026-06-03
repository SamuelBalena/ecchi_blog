import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import type { Post } from "@/lib/types";

export function DifficultyBadge({ d }: { d: Post["difficulty"] }) {
  const { t } = useI18n();
  const styles = {
    beginner: "border border-accent text-accent",
    intermediate: "border border-foreground/20 text-foreground",
    advanced: "bg-foreground text-background",
  }[d];
  return (
    <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-widest rounded-full ${styles}`}>
      {t(d)}
    </span>
  );
}

export function PostCard({ post }: { post: Post }) {
  const { tr } = useI18n();
  const date = new Date(post.createdAt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).toUpperCase();

  return (
    <Link
      to="/post/$id"
      params={{ id: post.id }}
      className="group grid grid-cols-1 md:grid-cols-[280px_1fr] gap-8 items-center cursor-pointer"
    >
      <div className="aspect-[4/3] bg-stone-100 outline outline-1 -outline-offset-1 outline-black/5 overflow-hidden rounded-sm transition-transform duration-500 group-hover:scale-[1.02]">
        <img src={post.coverImage} alt={tr(post.title)} className="w-full h-full object-cover" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <DifficultyBadge d={post.difficulty} />
          <span className="text-[11px] font-mono text-muted-foreground">{date}</span>
        </div>
        <h3 className="text-2xl font-display group-hover:text-accent transition-colors text-balance">
          {tr(post.title)}
        </h3>
      </div>
    </Link>
  );
}
