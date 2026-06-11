import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import { useI18n } from "@/lib/i18n";
import { fileToDataUrl } from "@/lib/image-utils";
import type { Collection } from "@/lib/types";

export const Route = createFileRoute("/admin/collections")({
  component: AdminCollections,
});

function emptyCollection(): Collection {
  return {
    id: crypto.randomUUID(),
    slug: "",
    name: { pt: "", en: "", jp: "" },
    coverImage: "",
  };
}

function AdminCollections() {
  const { t } = useI18n();
  const [items, setItems] = useState<Collection[]>([]);
  const [editing, setEditing] = useState<Collection | null>(null);

  const refresh = async () => setItems(await api.collections.list());
  useEffect(() => {
    void refresh();
  }, []);

  const save = async (c: Collection) => {
    const exists = (await api.collections.list()).some((x) => x.id === c.id);
    if (exists) await api.collections.update(c);
    else await api.collections.create(c);
    setEditing(null);
    await refresh();
  };

  const del = async (id: string) => {
    if (!confirm(t("confirm_delete"))) return;
    await api.collections.delete(id);
    await refresh();
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-muted-foreground">
          {t("admin_collections")}
        </h2>
        <button
          onClick={() => setEditing(emptyCollection())}
          className="bg-foreground text-background px-4 py-2 text-[11px] font-mono uppercase tracking-widest rounded hover:opacity-85"
        >
          + {t("new_collection")}
        </button>
      </div>

      <div className="border-t border-border">
        {items.map((c) => (
          <div
            key={c.id}
            className="grid grid-cols-[80px_1fr_auto] gap-6 items-center py-5 border-b border-border"
          >
            <div className="aspect-square bg-stone-100 rounded-sm overflow-hidden">
              {c.coverImage && (
                <img
                  src={c.coverImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div>
              <h3 className="text-lg font-display">
                {c.name.pt || c.name.en || c.slug}
              </h3>
              <p className="text-[11px] font-mono uppercase tracking-widest text-muted-foreground">
                /{c.slug}
              </p>
            </div>
            <div className="flex gap-3 text-[11px] font-mono uppercase tracking-widest">
              <button
                onClick={() => setEditing(c)}
                className="text-accent hover:underline"
              >
                {t("edit")}
              </button>
              <button
                onClick={() => del(c.id)}
                className="text-destructive hover:underline"
              >
                {t("delete")}
              </button>
            </div>
          </div>
        ))}
      </div>

      {editing && (
        <CollectionForm
          collection={editing}
          onSave={save}
          onCancel={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function CollectionForm({
  collection,
  onSave,
  onCancel,
}: {
  collection: Collection;
  onSave: (c: Collection) => void;
  onCancel: () => void;
}) {
  const { t } = useI18n();
  const [c, setC] = useState(collection);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setC({ ...c, coverImage: await fileToDataUrl(f) });
  };

  return (
    <div
      className="fixed inset-0 bg-foreground/40 grid place-items-center z-50 p-6"
      onClick={onCancel}
    >
      <div
        className="bg-background w-full max-w-xl p-8 rounded-sm"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-2xl font-display mb-6">{t("new_collection")}</h3>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            onSave(c);
          }}
          className="space-y-4"
        >
          <Field label={t("slug")}>
            <input
              required
              value={c.slug}
              onChange={(e) =>
                setC({
                  ...c,
                  slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
                })
              }
              className="input"
            />
          </Field>
          <Field label="PT">
            <input
              value={c.name.pt}
              onChange={(e) =>
                setC({ ...c, name: { ...c.name, pt: e.target.value } })
              }
              className="input"
            />
          </Field>
          <Field label="EN">
            <input
              value={c.name.en}
              onChange={(e) =>
                setC({ ...c, name: { ...c.name, en: e.target.value } })
              }
              className="input"
            />
          </Field>
          <Field label="JP">
            <input
              value={c.name.jp}
              onChange={(e) =>
                setC({ ...c, name: { ...c.name, jp: e.target.value } })
              }
              className="input"
            />
          </Field>
          <Field label={t("cover_image")}>
            <input
              type="file"
              accept="image/*"
              onChange={onUpload}
              className="text-xs"
            />
            {c.coverImage && (
              <img src={c.coverImage} alt="" className="mt-2 h-16 rounded-sm" />
            )}
          </Field>
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="bg-foreground text-background px-6 py-3 text-[11px] font-mono uppercase tracking-widest rounded"
            >
              {t("save")}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-[11px] font-mono uppercase tracking-widest border border-border rounded"
            >
              {t("cancel")}
            </button>
          </div>
        </form>
        <style>{`.input{width:100%;background:transparent;border:none;border-bottom:1px solid var(--input);padding:8px 0;font-size:14px;outline:none}.input:focus{border-color:var(--ring)}`}</style>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-widest text-muted-foreground mb-1">
        {label}
      </span>
      {children}
    </label>
  );
}
