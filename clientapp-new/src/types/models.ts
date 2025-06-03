export interface Article {
  id: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string | null;
  authorId: string;
  authorName: string;
  viewCount: number;
  imagePaths: string[];
  imagePath?: string;
  categories: Category[];
  tags: Tag[];
  likeCount: number;
  isLikedByCurrentUser: boolean;
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
  images: File[];
  image?: File;
}

export interface UpdateArticleDto {
  title: string;
  content: string;
  categoryIds: number[];
  tagIds: number[];
  images: File[];
  image?: File;
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

export interface Comment {
  id: number;
  text: string;
  createdAt: string;
  updatedAt: string | null;
  authorId: string;
  authorName: string;
  articleId: number;
  parentCommentId?: number | null;
  likesCount: number;
  isLikedByCurrentUser: boolean;
  replies: Comment[];
}

export interface CommentList {
  comments: Comment[];
  totalCount: number;
  pageCount: number;
  currentPage: number;
  pageSize: number;
}

export interface CreateCommentDto {
  text: string;
  authorId: string;
  articleId: number;
  parentCommentId?: number | null;
}

export interface UpdateCommentDto {
  text: string;
}

export interface ArticleLike {
  id: number;
  userId: string;
  userName: string;
  articleId: number;
  createdAt: string;
}

export interface CommentLike {
  id: number;
  userId: string;
  userName: string;
  commentId: number;
  createdAt: string;
}

export interface CreateArticleLikeDto {
  userId: string;
  articleId: number;
}

export interface CreateCommentLikeDto {
  userId: string;
  commentId: number;
} 