import api from './api';
import { ArticleLike, CommentLike, CreateArticleLikeDto, CreateCommentLikeDto } from '../types/models';

// Получить информацию о лайках статьи
export const getArticleLikes = async (articleId: number, page = 1, pageSize = 10): Promise<ArticleLike[]> => {
  const params = { page, pageSize };
  const response = await api.get<ArticleLike[]>(`/Likes/Article/${articleId}`, { params });
  return response.data;
};

// Получить количество лайков статьи
export const getArticleLikesCount = async (articleId: number): Promise<number> => {
  const response = await api.get<number>(`/Likes/Article/${articleId}/Count`);
  return response.data;
};

// Проверить, поставил ли текущий пользователь лайк статье
export const hasUserLikedArticle = async (articleId: number): Promise<boolean> => {
  const response = await api.get<boolean>(`/Likes/Article/${articleId}/HasLiked`);
  return response.data;
};

// Поставить лайк статье
export const likeArticle = async (articleId: number): Promise<ArticleLike> => {
  const dto: CreateArticleLikeDto = {
    userId: '', // Будет заполнено на сервере из токена
    articleId: articleId
  };
  const response = await api.post<ArticleLike>('/Likes/Article', dto);
  return response.data;
};

// Убрать лайк со статьи
export const unlikeArticle = async (articleId: number): Promise<void> => {
  await api.delete(`/Likes/Article/${articleId}`);
};

// Получить информацию о лайках комментария
export const getCommentLikes = async (commentId: number, page = 1, pageSize = 10): Promise<CommentLike[]> => {
  const params = { page, pageSize };
  const response = await api.get<CommentLike[]>(`/Likes/Comment/${commentId}`, { params });
  return response.data;
};

// Получить количество лайков комментария
export const getCommentLikesCount = async (commentId: number): Promise<number> => {
  const response = await api.get<number>(`/Likes/Comment/${commentId}/Count`);
  return response.data;
};

// Проверить, поставил ли текущий пользователь лайк комментарию
export const hasUserLikedComment = async (commentId: number): Promise<boolean> => {
  const response = await api.get<boolean>(`/Likes/Comment/${commentId}/HasLiked`);
  return response.data;
};

// Поставить лайк комментарию
export const likeComment = async (commentId: number): Promise<CommentLike> => {
  const dto: CreateCommentLikeDto = {
    userId: '', // Будет заполнено на сервере из токена
    commentId: commentId
  };
  const response = await api.post<CommentLike>('/Likes/Comment', dto);
  return response.data;
};

// Убрать лайк с комментария
export const unlikeComment = async (commentId: number): Promise<void> => {
  await api.delete(`/Likes/Comment/${commentId}`);
};