import { useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { db } from "@/lib/storage";
import { fileToDataUrl } from "@/lib/image-utils";
import type { Difficulty, Lang, Post } from "@/lib/types";

interface Props {
  initial?: Post;
  onSave: (post: Post) => void;
  onCancel: () => void;
}

export function PostEditor({ initial, onSave, onCancel }: Props) {
  const { t } = useI18n();
  const collections = db.getCollections();
  const [activeLang, setActiveLang] = useState<Lang>("pt");
  const [titlePt, setTitlePt] = useState(initial?.title.pt ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [titleJp, setTitleJp] = useState(initial?.title.jp ?? "");
  const [contentPt, setContentPt] = useState(initial?.content.pt ?? "");
  const [contentEn, setContentEn] = useState(initial?.content.en ?? "");
  const [contentJp, setContentJp] = useState(initial?.content.jp ?? "");
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(initial?.difficulty ?? "beginner");
  const [collectionId, setCollectionId] = useState<string | null>(initial?.collectionId ?? null);
  const contentRef = useRef<HTMLTextAreaElement>(null);

  const titleSetter = { pt: setTitlePt, en: setTitleEn, jp: setTitleJp }[activeLang];
  const titleVal = { pt: titlePt, en: titleEn, jp: titleJp }[activeLang];
  const contentSetter = { pt: setContentPt, en: setContentEn, jp: setContentJp }[activeLang];
  const contentVal = { pt: contentPt, en: contentEn, jp: contentJp }[activeLang];

  const onCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCover(await fileToDataUrl(f));
  };

  const onInsertImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = await fileToDataUrl(f);
    const snippet = `\n\n![${f.name}](${url})\n\n`;
    contentSetter(contentVal + snippet);
    e.target.value = "";
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cover) { alert(t("cover_image") + " ?"); return; }
    const post: Post = {
      id: initial?.id ?? crypto.randomUUID(),
      title: { pt: titlePt, en: titleEn, jp: titleJp },
      content: { pt: contentPt, en: contentEn, jp: contentJp },
      coverImage: cover,
      difficulty,
      collectionId,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    onSave(post);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FieldSelect label={t("difficulty")} value={difficulty} onChange={(v) => setDifficulty(v as Difficulty)} options={[
          { v: "beginner", l: t("beginner") },
          { v: "intermediate", l: t("intermediate") },
          { v: "advanced", l: t("advanced") },
        ]} />
        <FieldSelect label={t("collection")} value={collectionId ?? ""} onChange={(v) => setCollectionId(v || null)} options={[
          { v: "", l: t("none") },
          ...collections.map((c) => ({ v: c.id, l: c.name.pt || c.name.en || c.slug })),
        ]} />
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{t("cover_image")}</label>
          <input type="file" accept="image/*" onChange={onCoverUpload} className="text-xs" />
          {cover && <img src={cover} alt="" className="mt-2 h-16 w-auto rounded-sm object-cover" />}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex gap-2 mb-4">
          {(["pt", "en", "jp"] as Lang[]).map((l) => (
            <button key={l} type="button" onClick={() => setActiveLang(l)} className={`px-3 py-1 text-[11px] font-mono uppercase tracking-widest rounded ${
              activeLang === l ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}>
              {l}
            </button>
          ))}
        </div>
        <label className="block mb-6">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">{t("title")} ({activeLang.toUpperCase()})</span>
          <input value={titleVal} onChange={(e) => titleSetter(e.target.value)} className="w-full bg-transparent border-b border-input py-2 text-lg font-display focus:outline-none focus:border-ring" />
        </label>
        <div className="mb-2 flex justify-between items-center">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">{t("content")} ({activeLang.toUpperCase()})</span>
          <label className="text-[11px] font-mono uppercase tracking-widest text-accent cursor-pointer hover:underline">
            + {t("insert_image")}
            <input type="file" accept="image/*" onChange={onInsertImage} className="hidden" />
          </label>
        </div>
        <textarea ref={contentRef} value={contentVal} onChange={(e) => contentSetter(e.target.value)} rows={14} className="w-full bg-card border border-border rounded-sm p-4 text-sm leading-relaxed focus:outline-none focus:border-ring font-sans" />
        <p className="text-[10px] font-mono text-muted-foreground mt-2">
          Use double line breaks for paragraphs. Images: ![alt](url)
        </p>
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button type="submit" className="bg-foreground text-background px-6 py-3 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85">
          {t("save")}
        </button>
        <button type="button" onClick={onCancel} className="px-6 py-3 text-[11px] font-mono uppercase tracking-widest border border-border rounded hover:bg-muted">
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

function FieldSelect({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ring">
        {options.map((o) => <option key={o.v} value={o.v}>{o.l}</option>)}
      </select>
    </label>
  );
}
