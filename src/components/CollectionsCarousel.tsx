import { Link } from "@tanstack/react-router";
import { useI18n } from "@/lib/i18n";
import type { Collection } from "@/lib/types";

export function CollectionsCarousel({ collections }: { collections: Collection[] }) {
  const { tr, t } = useI18n();
  return (
    <section className="pb-32 animate-reveal">
      <div className="flex items-end justify-between mb-12 border-b border-border pb-4">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] font-medium">{t("collections")}</h2>
      </div>
      <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide snap-x -mx-6 px-6">
        {collections.map((c) => (
          <Link
            key={c.id}
            to="/collections/$slug"
            params={{ slug: c.slug }}
            className="flex-none w-[320px] snap-start group"
          >
            <div className="aspect-[4/5] bg-stone-100 outline outline-1 -outline-offset-1 outline-black/5 rounded-sm mb-4 overflow-hidden">
              <img src={c.coverImage} alt={tr(c.name)} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
            </div>
            <h4 className="text-lg font-display group-hover:text-accent transition-colors">{tr(c.name)}</h4>
          </Link>
        ))}
      </div>
    </section>
  );
}
