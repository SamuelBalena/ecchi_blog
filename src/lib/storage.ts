import type { Collection, Post, User } from "./types";

const K = {
  users: "ea:users",
  posts: "ea:posts",
  collections: "ea:collections",
  session: "ea:session",
  lang: "ea:lang",
  seeded: "ea:seeded:v1",
};

const isClient = () => typeof window !== "undefined";

function read<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (!isClient()) return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const db = {
  // users
  getUsers: () => read<User[]>(K.users, []),
  setUsers: (u: User[]) => write(K.users, u),
  // posts
  getPosts: () => read<Post[]>(K.posts, []),
  setPosts: (p: Post[]) => write(K.posts, p),
  // collections
  getCollections: () => read<Collection[]>(K.collections, []),
  setCollections: (c: Collection[]) => write(K.collections, c),
  // session
  getSessionId: () => read<string | null>(K.session, null),
  setSessionId: (id: string | null) => write(K.session, id),
  // lang
  getLang: () => read<"pt" | "en" | "jp">(K.lang, "pt"),
  setLang: (l: "pt" | "en" | "jp") => write(K.lang, l),
  // seed flag
  isSeeded: () => read<boolean>(K.seeded, false),
  markSeeded: () => write(K.seeded, true),
};

export const ADMIN_EMAIL = "admin@ecchiacademy.com";

export function seedIfNeeded() {
  if (!isClient() || db.isSeeded()) return;

  const adminUser: User = {
    id: crypto.randomUUID(),
    name: "Admin",
    email: ADMIN_EMAIL,
    password: "admin123",
    role: "ADMIN",
  };
  const demoUser: User = {
    id: crypto.randomUUID(),
    name: "Demo User",
    email: "user@ecchiacademy.com",
    password: "user123",
    role: "USUARIO",
  };
  db.setUsers([adminUser, demoUser]);

  const collections: Collection[] = [
    {
      id: crypto.randomUUID(),
      slug: "foundation",
      name: { pt: "Fundamentos", en: "Foundation Series", jp: "基礎シリーズ" },
      coverImage: gradient("#1a1a1a", "#444"),
    },
    {
      id: crypto.randomUUID(),
      slug: "cinematic",
      name: { pt: "Composição Cinemática", en: "Cinematic Composition", jp: "シネマ構図" },
      coverImage: gradient("#2d1b0e", "#6b3a2a"),
    },
    {
      id: crypto.randomUUID(),
      slug: "perspective",
      name: { pt: "Perspectiva Avançada", en: "Mastering Perspective", jp: "遠近法" },
      coverImage: gradient("#0c2340", "#2d8a9e"),
    },
  ];
  db.setCollections(collections);

  const posts: Post[] = [
    {
      id: crypto.randomUUID(),
      title: {
        pt: "Anatomia do Olhar: posicionamento dos olhos do personagem",
        en: "Anatomy of Gaze: character eye placement",
        jp: "視線の解剖学：キャラクターの目の配置",
      },
      content: {
        pt: "Explorando como pequenas mudanças na dilatação da pupila comunicam interioridade nos painéis clássicos de shonen.\n\nNeste artigo introdutório, vamos abordar os princípios básicos.",
        en: "Exploring how subtle shifts in pupil dilation communicate interiority in classic shonen panels.\n\nIn this introductory article, we'll cover the basics.",
        jp: "瞳孔の微妙な変化がどのように内面性を伝えるかを探ります。\n\nこの入門記事では基本を扱います。",
      },
      coverImage: gradient("#3a2a1a", "#a07a4a"),
      difficulty: "beginner",
      collectionId: collections[0].id,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 2,
    },
    {
      id: crypto.randomUUID(),
      title: {
        pt: "O Peso da Linha: técnicas G-pen vs Maru-pen",
        en: "The Weight of Line: G-pen vs Maru-pen techniques",
        jp: "線の重み：Gペンと丸ペンの技法",
      },
      content: {
        pt: "Um detalhamento técnico da pressão da pena e viscosidade da tinta para alcançar as linhas dinâmicas dos mangás de ação dos anos 90.",
        en: "A technical breakdown of nib pressure and ink viscosity for achieving the iconic dynamic lines of 90s action manga.",
        jp: "90年代のアクション漫画の象徴的なダイナミックな線を実現するための技術的な解説。",
      },
      coverImage: gradient("#1a1a2a", "#5a5a8a"),
      difficulty: "intermediate",
      collectionId: collections[1].id,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 5,
    },
    {
      id: crypto.randomUUID(),
      title: {
        pt: "Melancolia Urbana: arte de fundo em OVAs do final dos anos 80",
        en: "Urban Melancholy: Background art in late-80s OVA series",
        jp: "都市の憂鬱：80年代後半のOVA背景美術",
      },
      content: {
        pt: "Analisando o uso da perspectiva atmosférica e fundos pintados à mão para estabelecer humor em clássicos da ficção científica.",
        en: "Analyzing the use of atmospheric perspective and hand-painted cel backgrounds to establish mood in sci-fi classics.",
        jp: "大気遠近法と手描きのセル背景を分析。",
      },
      coverImage: gradient("#0a1428", "#3a5a8a"),
      difficulty: "advanced",
      collectionId: collections[2].id,
      createdAt: Date.now() - 1000 * 60 * 60 * 24 * 8,
    },
  ];
  db.setPosts(posts);
  db.markSeeded();
}

function gradient(a: string, b: string): string {
  // SVG data URL placeholder
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 640 480'><defs><linearGradient id='g' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient></defs><rect width='640' height='480' fill='url(%23g)'/></svg>`;
  return `data:image/svg+xml;utf8,${svg.replace(/#/g, "%23")}`;
}
