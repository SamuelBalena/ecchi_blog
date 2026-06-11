import type {
  Collection,
  Difficulty,
  Post,
  RichContent,
  Role,
  Translated,
  User,
} from "./types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

type ApiEnvelope<T> = {
  status?: string;
  message?: string;
  data?: T;
};

type ApiUser = Partial<User> & { _id?: string };
type ApiCollection = {
  _id?: string;
  id?: string;
  name?: string | Partial<Translated>;
  description?: string;
  slug?: string;
  coverImage?: string;
};
type ApiPost = {
  _id?: string;
  id?: string;
  title?: Partial<Translated> | string;
  content?: Partial<Translated<RichContent>> | string;
  difficulty?: string;
  collectionId?: string | null;
  coverImage?: string;
  language?: string;
  text?: string;
  images?: string[];
  createdAt?: string | number;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  let body: ApiEnvelope<T> | T | null = null;
  const text = await response.text();
  if (text) {
    try {
      body = JSON.parse(text) as ApiEnvelope<T> | T;
    } catch {
      body = null;
    }
  }

  if (!response.ok) {
    const message =
      body && typeof body === "object" && "message" in body
        ? String(body.message)
        : response.statusText;
    throw new Error(message || "Erro ao acessar a API");
  }

  if (body && typeof body === "object" && "data" in body) {
    return (body as ApiEnvelope<T>).data as T;
  }
  return body as T;
}

const translated = (value: unknown, fallback = ""): Translated => {
  if (typeof value === "string") return { pt: value, en: value, jp: value };
  if (value && typeof value === "object") {
    const v = value as Partial<Translated>;
    return {
      pt: v.pt ?? fallback,
      en: v.en ?? v.pt ?? fallback,
      jp: v.jp ?? v.pt ?? fallback,
    };
  }
  return { pt: fallback, en: fallback, jp: fallback };
};

const translatedContent = (
  value: unknown,
  fallback: RichContent = "",
): Translated<RichContent> => {
  if (typeof value === "string") return { pt: value, en: value, jp: value };
  if (value && typeof value === "object") {
    const v = value as Partial<Translated<RichContent>>;
    return {
      pt: v.pt ?? fallback,
      en: v.en ?? v.pt ?? fallback,
      jp: v.jp ?? v.pt ?? fallback,
    };
  }
  return { pt: fallback, en: fallback, jp: fallback };
};

const isEditorData = (
  value: RichContent,
): value is Exclude<RichContent, string> =>
  typeof value === "object" && value !== null && Array.isArray(value.blocks);

const richContentToText = (content: RichContent): string => {
  if (typeof content === "string") return content;
  if (!isEditorData(content)) return "";

  return content.blocks
    .map((block) => {
      const data = block.data as Record<string, unknown>;
      if (typeof data.text === "string")
        return data.text.replace(/<[^>]*>/g, "");
      if (Array.isArray(data.items)) {
        return data.items
          .map((item) =>
            typeof item === "string"
              ? item.replace(/<[^>]*>/g, "")
              : typeof item === "object" && item && "content" in item
                ? String(item.content).replace(/<[^>]*>/g, "")
                : "",
          )
          .filter(Boolean)
          .join("\n");
      }
      if (typeof data.caption === "string")
        return data.caption.replace(/<[^>]*>/g, "");
      return "";
    })
    .filter(Boolean)
    .join("\n\n");
};

const richContentImages = (content: RichContent): string[] => {
  if (!isEditorData(content)) return [];
  return content.blocks
    .map((block) => {
      const data = block.data as { file?: { url?: unknown }; url?: unknown };
      return typeof data.file?.url === "string"
        ? data.file.url
        : typeof data.url === "string"
          ? data.url
          : "";
    })
    .filter(Boolean);
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

const difficultyFromApi = (value?: string): Difficulty => {
  if (value === "facil") return "beginner";
  if (value === "medio") return "intermediate";
  if (value === "dificil") return "advanced";
  if (value === "beginner" || value === "intermediate" || value === "advanced")
    return value;
  return "beginner";
};

const difficultyToApi = (value: Difficulty) =>
  ({ beginner: "facil", intermediate: "medio", advanced: "dificil" })[value];

const dateFromApi = (value: string | number | undefined) => {
  if (!value) return Date.now();
  if (typeof value === "number") return value;
  const time = new Date(value).getTime();
  return Number.isNaN(time) ? Date.now() : time;
};

const normalizeUser = (user: ApiUser): User => ({
  id: user.id ?? user._id ?? "",
  name: user.name ?? "",
  email: user.email ?? "",
  password: user.password ?? "",
  role: (user.role as Role) ?? "USUARIO",
});

const normalizeCollection = (collection: ApiCollection): Collection => {
  const name = translated(collection.name, collection.description ?? "");
  const label =
    name.pt || name.en || collection.slug || collection._id || "colecao";
  return {
    id: collection.id ?? collection._id ?? "",
    slug: collection.slug ?? slugify(label),
    name,
    coverImage: collection.coverImage ?? "",
  };
};

const normalizePost = (post: ApiPost): Post => {
  const text = post.text ?? "";
  const titleFallback = text.split(/\n+/).find(Boolean) ?? "Sem titulo";
  const contentFallback = text || titleFallback;
  return {
    id: post.id ?? post._id ?? "",
    title: translated(post.title, titleFallback),
    content: translatedContent(post.content, contentFallback),
    coverImage: post.coverImage ?? post.images?.[0] ?? "",
    difficulty: difficultyFromApi(post.difficulty),
    collectionId: post.collectionId ?? null,
    createdAt: dateFromApi(post.createdAt),
  };
};

const postPayload = (post: Post) => ({
  title: post.title,
  content: post.content,
  difficulty: difficultyToApi(post.difficulty),
  collectionId: post.collectionId,
  coverImage: post.coverImage,
  language: "pt-BR",
  text: `${post.title.pt}\n\n${richContentToText(post.content.pt)}`.trim(),
  images: [post.coverImage, ...richContentImages(post.content.pt)].filter(
    Boolean,
  ),
  createdAt: new Date(post.createdAt).toISOString(),
});

const collectionPayload = (collection: Collection) => ({
  name: collection.name.pt || collection.name.en || collection.slug,
  description: collection.name.en || collection.name.jp || "",
  slug: collection.slug,
  coverImage: collection.coverImage,
});

const userPayload = (user: User) => ({
  name: user.name,
  email: user.email,
  password: user.password,
  role: user.role,
});

export const api = {
  users: {
    list: async () => (await request<ApiUser[]>("/users")).map(normalizeUser),
    create: async (user: User) =>
      normalizeUser(
        await request<ApiUser>("/users", {
          method: "POST",
          body: JSON.stringify(userPayload(user)),
        }),
      ),
    update: async (user: User) =>
      normalizeUser(
        await request<ApiUser>(`/users/${user.id}`, {
          method: "PUT",
          body: JSON.stringify(userPayload(user)),
        }),
      ),
    delete: async (id: string) =>
      request<void>(`/users/${id}`, { method: "DELETE" }),
  },
  posts: {
    list: async () => (await request<ApiPost[]>("/posts")).map(normalizePost),
    get: async (id: string) =>
      normalizePost(await request<ApiPost>(`/posts/${id}`)),
    create: async (post: Post) =>
      normalizePost(
        await request<ApiPost>("/posts", {
          method: "POST",
          body: JSON.stringify(postPayload(post)),
        }),
      ),
    update: async (post: Post) =>
      normalizePost(
        await request<ApiPost>(`/posts/${post.id}`, {
          method: "PUT",
          body: JSON.stringify(postPayload(post)),
        }),
      ),
    delete: async (id: string) =>
      request<void>(`/posts/${id}`, { method: "DELETE" }),
  },
  collections: {
    list: async () =>
      (await request<ApiCollection[]>("/collections")).map(normalizeCollection),
    get: async (id: string) =>
      normalizeCollection(await request<ApiCollection>(`/collections/${id}`)),
    create: async (collection: Collection) =>
      normalizeCollection(
        await request<ApiCollection>("/collections", {
          method: "POST",
          body: JSON.stringify(collectionPayload(collection)),
        }),
      ),
    update: async (collection: Collection) =>
      normalizeCollection(
        await request<ApiCollection>(`/collections/${collection.id}`, {
          method: "PUT",
          body: JSON.stringify(collectionPayload(collection)),
        }),
      ),
    delete: async (id: string) =>
      request<void>(`/collections/${id}`, { method: "DELETE" }),
  },
};
