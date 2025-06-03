import api from './api';
import { AdminStats, UserList, BlockUserDto, UpdateUserRolesDto, User } from '../types/admin';
import { ArticleList, CommentList } from '../types/models';

// Статистика
export const getAdminStats = async (): Promise<AdminStats> => {
  const response = await api.get<AdminStats>('/Admin/stats');
  return response.data;
};

// Управление пользователями
export const getUsers = async (page = 1, pageSize = 10, searchTerm?: string): Promise<UserList> => {
  const params = { page, pageSize, searchTerm };
  const response = await api.get<UserList>('/Admin/users', { params });
  return response.data;
};

export const blockUser = async (blockData: BlockUserDto): Promise<void> => {
  await api.post('/Admin/users/block', blockData);
};

export const updateUserRoles = async (roleData: UpdateUserRolesDto): Promise<void> => {
  await api.post('/Admin/users/roles', roleData);
};

export const deleteUser = async (userId: string): Promise<void> => {
  await api.delete(`/Admin/users/${userId}`);
};

// Управление статьями
export const getArticlesForModeration = async (page = 1, pageSize = 10, searchTerm?: string): Promise<ArticleList> => {
  const params = { page, pageSize, searchTerm };
  const response = await api.get<ArticleList>('/Admin/articles', { params });
  return response.data;
};

export const deleteArticleAdmin = async (articleId: number): Promise<void> => {
  await api.delete(`/Admin/articles/${articleId}`);
};

// Управление комментариями
export const getCommentsForModeration = async (page = 1, pageSize = 10): Promise<CommentList> => {
  const params = { page, pageSize };
  const response = await api.get<CommentList>('/Admin/comments', { params });
  return response.data;
};

export const deleteCommentAdmin = async (commentId: number): Promise<void> => {
  await api.delete(`/Admin/comments/${commentId}`);
}; 