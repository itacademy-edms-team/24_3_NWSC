import api from './api';
import { CommentList, Comment, CreateCommentDto, UpdateCommentDto } from '../types/models';

// Получить комментарии к статье
export const getArticleComments = async (articleId: number, page = 1, pageSize = 10): Promise<CommentList> => {
  const params = { page, pageSize };
  const response = await api.get<CommentList>(`/Comments/Article/${articleId}`, { params });
  return response.data;
};

// Получить комментарий по ID
export const getCommentById = async (id: number): Promise<Comment> => {
  const response = await api.get<Comment>(`/Comments/${id}`);
  return response.data;
};

// Создать новый комментарий
export const createComment = async (comment: CreateCommentDto): Promise<Comment> => {
  const response = await api.post<Comment>('/Comments', comment);
  return response.data;
};

// Обновить комментарий
export const updateComment = async (id: number, comment: UpdateCommentDto): Promise<Comment> => {
  const response = await api.put<Comment>(`/Comments/${id}`, comment);
  return response.data;
};

// Удалить комментарий
export const deleteComment = async (id: number): Promise<void> => {
  await api.delete(`/Comments/${id}`);
}; 