import type { OutputData } from "@editorjs/editorjs";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useI18n } from "@/lib/i18n";
import { api } from "@/lib/api-client";
import { fileToDataUrl } from "@/lib/image-utils";
import type {
  Collection,
  Difficulty,
  Lang,
  Post,
  RichContent,
} from "@/lib/types";

interface Props {
  initial?: Post;
  onSave: (post: Post) => void | Promise<void>;
  onCancel: () => void;
}

export function PostEditor({ initial, onSave, onCancel }: Props) {
  const { t } = useI18n();
  const [collections, setCollections] = useState<Collection[]>([]);
  const [activeLang, setActiveLang] = useState<Lang>("pt");
  const [titlePt, setTitlePt] = useState(initial?.title.pt ?? "");
  const [titleEn, setTitleEn] = useState(initial?.title.en ?? "");
  const [titleJp, setTitleJp] = useState(initial?.title.jp ?? "");
  const [contentPt, setContentPt] = useState(initial?.content.pt ?? "");
  const [contentEn, setContentEn] = useState(initial?.content.en ?? "");
  const [contentJp, setContentJp] = useState(initial?.content.jp ?? "");
  const [cover, setCover] = useState(initial?.coverImage ?? "");
  const [difficulty, setDifficulty] = useState<Difficulty>(
    initial?.difficulty ?? "beginner",
  );
  const [collectionId, setCollectionId] = useState<string | null>(
    initial?.collectionId ?? null,
  );
  const editorRef = useRef<RichTextEditorHandle>(null);

  const titleSetter = { pt: setTitlePt, en: setTitleEn, jp: setTitleJp }[
    activeLang
  ];
  const titleVal = { pt: titlePt, en: titleEn, jp: titleJp }[activeLang];
  const contentSetter = {
    pt: setContentPt,
    en: setContentEn,
    jp: setContentJp,
  }[activeLang];
  const contentVal = { pt: contentPt, en: contentEn, jp: contentJp }[
    activeLang
  ];

  useEffect(() => {
    void api.collections.list().then(setCollections);
  }, []);

  const onCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setCover(await fileToDataUrl(f));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const currentContent = await editorRef.current?.save();
    const nextContent = {
      pt: contentPt,
      en: contentEn,
      jp: contentJp,
      [activeLang]: currentContent ?? contentVal,
    };
    if (!cover) {
      alert(t("cover_image") + " ?");
      return;
    }
    const post: Post = {
      id: initial?.id ?? crypto.randomUUID(),
      title: { pt: titlePt, en: titleEn, jp: titleJp },
      content: nextContent,
      coverImage: cover,
      difficulty,
      collectionId,
      createdAt: initial?.createdAt ?? Date.now(),
    };
    await onSave(post);
  };

  return (
    <form onSubmit={submit} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <FieldSelect
          label={t("difficulty")}
          value={difficulty}
          onChange={(v) => setDifficulty(v as Difficulty)}
          options={[
            { v: "beginner", l: t("beginner") },
            { v: "intermediate", l: t("intermediate") },
            { v: "advanced", l: t("advanced") },
          ]}
        />
        <FieldSelect
          label={t("collection")}
          value={collectionId ?? ""}
          onChange={(v) => setCollectionId(v || null)}
          options={[
            { v: "", l: t("none") },
            ...collections.map((c) => ({
              v: c.id,
              l: c.name.pt || c.name.en || c.slug,
            })),
          ]}
        />
        <div>
          <label className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
            {t("cover_image")}
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={onCoverUpload}
            className="text-xs"
          />
          {cover && (
            <img
              src={cover}
              alt=""
              className="mt-2 h-16 w-auto rounded-sm object-cover"
            />
          )}
        </div>
      </div>

      <div className="border-t border-border pt-6">
        <div className="flex gap-2 mb-4">
          {(["pt", "en", "jp"] as Lang[]).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setActiveLang(l)}
              className={`px-3 py-1 text-[11px] font-mono uppercase tracking-widest rounded ${
                activeLang === l
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <label className="block mb-6">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
            {t("title")} ({activeLang.toUpperCase()})
          </span>
          <input
            value={titleVal}
            onChange={(e) => titleSetter(e.target.value)}
            className="w-full bg-transparent border-b border-input py-2 text-lg font-display focus:outline-none focus:border-ring"
          />
        </label>
        <div className="mb-2 flex justify-between items-center">
          <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
            {t("content")} ({activeLang.toUpperCase()})
          </span>
        </div>
        <RichTextEditor
          key={activeLang}
          ref={editorRef}
          value={contentVal}
          onChange={contentSetter}
        />
      </div>

      <div className="flex gap-3 pt-4 border-t border-border">
        <button
          type="submit"
          className="bg-foreground text-background px-6 py-3 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85"
        >
          {t("save")}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-3 text-[11px] font-mono uppercase tracking-widest border border-border rounded hover:bg-muted"
        >
          {t("cancel")}
        </button>
      </div>
    </form>
  );
}

type RichTextEditorHandle = {
  save: () => Promise<RichContent>;
};

const emptyEditorData = (): OutputData => ({
  time: Date.now(),
  blocks: [],
  version: "2.31.0",
});

const markdownishToEditorData = (value: string): OutputData => ({
  time: Date.now(),
  blocks: value
    .split(/\n\n+/)
    .map((chunk) => chunk.trim())
    .filter(Boolean)
    .map((chunk) => {
      const image = chunk.match(/^!\[(.*?)\]\((.+)\)$/);
      if (image) {
        return {
          id: crypto.randomUUID(),
          type: "image",
          data: {
            file: { url: image[2] },
            caption: image[1],
            withBorder: false,
            stretched: false,
            withBackground: false,
          },
        };
      }

      return {
        id: crypto.randomUUID(),
        type: "paragraph",
        data: { text: chunk.replace(/\n/g, "<br>") },
      };
    }),
  version: "2.31.0",
});

const toEditorData = (value: RichContent): OutputData => {
  if (typeof value === "string") {
    return value.trim() ? markdownishToEditorData(value) : emptyEditorData();
  }
  return value;
};

const RichTextEditor = forwardRef<
  RichTextEditorHandle,
  { value: RichContent; onChange: (value: RichContent) => void }
>(function RichTextEditor({ value, onChange }, ref) {
  const holderRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<import("@editorjs/editorjs").default | null>(null);
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  }, [onChange, value]);

  useImperativeHandle(ref, () => ({
    save: async () => {
      if (!editorRef.current) return valueRef.current;
      return await editorRef.current.save();
    },
  }));

  useEffect(() => {
    let cancelled = false;

    const init = async () => {
      const [
        { default: EditorJS },
        { default: Header },
        { default: List },
        { default: ImageTool },
        { default: Quote },
        { default: Delimiter },
        { default: Checklist },
      ] = await Promise.all([
        import("@editorjs/editorjs"),
        import("@editorjs/header"),
        import("@editorjs/list"),
        import("@editorjs/image"),
        import("@editorjs/quote"),
        import("@editorjs/delimiter"),
        import("@editorjs/checklist"),
      ]);

      if (cancelled || !holderRef.current) return;

      const editor = new EditorJS({
        holder: holderRef.current,
        data: toEditorData(valueRef.current),
        placeholder: "Comece a escrever...",
        autofocus: false,
        minHeight: 360,
        tools: {
          header: {
            class: Header,
            inlineToolbar: true,
            config: {
              levels: [2, 3, 4],
              defaultLevel: 2,
            },
          },
          list: {
            class: List,
            inlineToolbar: true,
          },
          image: {
            class: ImageTool,
            config: {
              uploader: {
                uploadByFile: async (file: File) => ({
                  success: 1,
                  file: {
                    url: await fileToDataUrl(file),
                  },
                }),
              },
            },
          },
          quote: {
            class: Quote,
            inlineToolbar: true,
          },
          delimiter: Delimiter,
          checklist: {
            class: Checklist,
            inlineToolbar: true,
          },
        },
        onChange: async () => {
          const data = await editor.save();
          onChangeRef.current(data);
        },
        onReady: () => setReady(true),
      });

      editorRef.current = editor;
    };

    void init();

    return () => {
      cancelled = true;
      setReady(false);
      void editorRef.current?.destroy();
      editorRef.current = null;
    };
  }, []);

  return (
    <div
      className={`rich-editor min-h-[420px] rounded-sm border border-border bg-card px-4 py-5 text-sm leading-relaxed transition-colors focus-within:border-ring ${
        ready ? "" : "opacity-70"
      }`}
    >
      <div ref={holderRef} />
    </div>
  );
});

function FieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { v: string; l: string }[];
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-2">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-card border border-border rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-ring"
      >
        {options.map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    </label>
  );
}
