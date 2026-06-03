export type Role = "ADMIN" | "USUARIO";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Lang = "pt" | "en" | "jp";

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Translated {
  pt: string;
  en: string;
  jp: string;
}

export interface Post {
  id: string;
  title: Translated;
  content: Translated;
  coverImage: string;
  difficulty: Difficulty;
  collectionId: string | null;
  createdAt: number;
}

export interface Collection {
  id: string;
  slug: string;
  name: Translated;
  coverImage: string;
}
