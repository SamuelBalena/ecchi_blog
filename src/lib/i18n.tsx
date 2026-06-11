import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { db } from "./storage";
import type { Lang, Translated } from "./types";

const dict = {
  pt: {
    nav_home: "Início",
    nav_collections: "Coleções",
    nav_settings: "Configurações",
    nav_admin: "Admin",
    nav_logout: "Sair",
    nav_login: "Entrar",
    hero_title_pre: "Um espaço calmo para",
    hero_title_em: "mangá",
    hero_title_post: ".",
    hero_subtitle: "Análises profundas sobre narrativa visual, desenho de personagens e história cultural da animação japonesa.",
    latest_posts: "Últimos Posts",
    view_archive: "Ver arquivo",
    collections: "Coleções",
    beginner: "Iniciante",
    intermediate: "Intermediário",
    advanced: "Avançado",
    login_title: "Entrar",
    register_title: "Criar conta",
    email: "Email",
    password: "Senha",
    name: "Nome",
    submit: "Enviar",
    no_account: "Não tem conta?",
    have_account: "Já tem conta?",
    create_one: "Criar uma",
    sign_in: "Entrar",
    settings_title: "Configurações da conta",
    save: "Salvar",
    saved: "Salvo",
    admin_posts: "Posts",
    admin_collections: "Coleções",
    admin_users: "Usuários",
    new_post: "Novo post",
    new_collection: "Nova coleção",
    new_user: "Novo usuário",
    edit: "Editar",
    delete: "Excluir",
    confirm_delete: "Tem certeza?",
    title: "Título",
    content: "Conteúdo",
    cover_image: "Imagem de capa",
    difficulty: "Dificuldade",
    collection: "Coleção",
    none: "Nenhuma",
    upload_image: "Carregar imagem",
    insert_image: "Inserir imagem no conteúdo",
    role: "Papel",
    no_posts: "Nenhum post ainda.",
    read_more: "Ler post",
    back: "Voltar",
    slug: "Slug",
    cancel: "Cancelar",
    invalid_login: "Email ou senha inválidos.",
    email_taken: "Email já cadastrado.",
    welcome_back: "Bem-vindo de volta",
  },
  en: {
    nav_home: "Home",
    nav_collections: "Collections",
    nav_settings: "Settings",
    nav_admin: "Admin",
    nav_logout: "Logout",
    nav_login: "Sign in",
    hero_title_pre: "A quiet space for",
    hero_title_em: "manga",
    hero_title_post: " scholarship.",
    hero_subtitle: "Deep dives into visual storytelling, character drafting, and the cultural history of contemporary Japanese animation.",
    latest_posts: "Latest Posts",
    view_archive: "View archive",
    collections: "Collections",
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
    login_title: "Sign in",
    register_title: "Create account",
    email: "Email",
    password: "Password",
    name: "Name",
    submit: "Submit",
    no_account: "No account?",
    have_account: "Already have an account?",
    create_one: "Create one",
    sign_in: "Sign in",
    settings_title: "Account settings",
    save: "Save",
    saved: "Saved",
    admin_posts: "Posts",
    admin_collections: "Collections",
    admin_users: "Users",
    new_post: "New post",
    new_collection: "New collection",
    new_user: "New user",
    edit: "Edit",
    delete: "Delete",
    confirm_delete: "Are you sure?",
    title: "Title",
    content: "Content",
    cover_image: "Cover image",
    difficulty: "Difficulty",
    collection: "Collection",
    none: "None",
    upload_image: "Upload image",
    insert_image: "Insert image in content",
    role: "Role",
    no_posts: "No posts yet.",
    read_more: "Read post",
    back: "Back",
    slug: "Slug",
    cancel: "Cancel",
    invalid_login: "Invalid email or password.",
    email_taken: "Email already registered.",
    welcome_back: "Welcome back",
  },
  jp: {
    nav_home: "ホーム",
    nav_collections: "コレクション",
    nav_settings: "設定",
    nav_admin: "管理",
    nav_logout: "ログアウト",
    nav_login: "ログイン",
    hero_title_pre: "静かな",
    hero_title_em: "漫画",
    hero_title_post: "研究の場。",
    hero_subtitle: "視覚的なストーリーテリング、キャラクターの描画、現代日本アニメーションの文化史について。",
    latest_posts: "最新の投稿",
    view_archive: "アーカイブを見る",
    collections: "コレクション",
    beginner: "初級",
    intermediate: "中級",
    advanced: "上級",
    login_title: "ログイン",
    register_title: "アカウント作成",
    email: "メール",
    password: "パスワード",
    name: "名前",
    submit: "送信",
    no_account: "アカウントがない？",
    have_account: "アカウントをお持ちですか？",
    create_one: "作成する",
    sign_in: "ログイン",
    settings_title: "アカウント設定",
    save: "保存",
    saved: "保存しました",
    admin_posts: "投稿",
    admin_collections: "コレクション",
    admin_users: "ユーザー",
    new_post: "新規投稿",
    new_collection: "新規コレクション",
    new_user: "新規ユーザー",
    edit: "編集",
    delete: "削除",
    confirm_delete: "本当に？",
    title: "タイトル",
    content: "内容",
    cover_image: "カバー画像",
    difficulty: "難易度",
    collection: "コレクション",
    none: "なし",
    upload_image: "画像をアップロード",
    insert_image: "内容に画像を挿入",
    role: "役割",
    no_posts: "まだ投稿がありません。",
    read_more: "投稿を読む",
    back: "戻る",
    slug: "スラッグ",
    cancel: "キャンセル",
    invalid_login: "メールまたはパスワードが無効です。",
    email_taken: "メールは既に登録されています。",
    welcome_back: "おかえりなさい",
  },
} as const;

type Key = keyof typeof dict.en;

interface I18nCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (k: Key) => string;
  tr: (v: Translated) => string;
}

const Ctx = createContext<I18nCtx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    setLangState(db.getLang());
  }, []);

  const setLang = (l: Lang) => {
    db.setLang(l);
    setLangState(l);
  };

  const t = (k: Key) => dict[lang][k] ?? dict.en[k];
  const tr = (v: Translated) => v[lang] || v.en || v.pt || "";

  return <Ctx.Provider value={{ lang, setLang, t, tr }}>{children}</Ctx.Provider>;
}

export function useI18n() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useI18n must be used within I18nProvider");
  return ctx;
}
