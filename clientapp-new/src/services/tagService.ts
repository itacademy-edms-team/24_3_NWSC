import api from './api';
import { Tag } from '../types/models';

export const tagService = {
  // Получить список всех тегов
  getTags: async (): Promise<Tag[]> => {
    const response = await api.get<Tag[]>('/Tags');
    return response.data;
  },

  // Получить тег по ID
  getTagById: async (id: number): Promise<Tag> => {
    const response = await api.get<Tag>(`/Tags/${id}`);
    return response.data;
  },

  // Создать новый тег
  createTag: async (tag: { name: string }): Promise<Tag> => {
    const response = await api.post<Tag>('/Tags', tag);
    return response.data;
  },

  // Обновить существующий тег
  updateTag: async (id: number, tag: { name: string }): Promise<Tag> => {
    const response = await api.put<Tag>(`/Tags/${id}`, tag);
    return response.data;
  },

  // Удалить тег
  deleteTag: async (id: number): Promise<void> => {
    await api.delete(`/Tags/${id}`);
  }
}; 