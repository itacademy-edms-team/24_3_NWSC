export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  authorId: string;
  authorName: string;
  viewCount: number;
  categories: Category[];
  tags: Tag[];
}

export interface ArticleList {
  articles: Article[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export interface Category {
  id: number;
  name: string;
  description: string;
}

export interface Tag {
  id: number;
  name: string;
}

export interface CreateArticleDto {
  title: string;
  content: string;
  authorId: string;
  categoryIds: number[];
  tagIds: number[];
}

export interface UpdateArticleDto {
  title: string;
  content: string;
  categoryIds: number[];
  tagIds: number[];
}

export interface User {
  email: string;
  firstName: string;
  lastName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface AuthResponse {
  token: string;
  logoutUrl: string;
  user: User;
} 