import type { OutputData } from "@editorjs/editorjs";

export type Role = "ADMIN" | "USUARIO";
export type Difficulty = "beginner" | "intermediate" | "advanced";
export type Lang = "pt" | "en" | "jp";
export type RichContent = string | OutputData;

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
}

export interface Translated<T = string> {
  pt: T;
  en: T;
  jp: T;
}

export interface Post {
  id: string;
  title: Translated;
  content: Translated<RichContent>;
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
