import api from './api';
import { Category } from '../types/models';

export const categoryService = {
  // Получить список всех категорий
  getCategories: async (): Promise<Category[]> => {
    const response = await api.get<Category[]>('/Categories');
    return response.data;
  },

  // Получить категорию по ID
  getCategoryById: async (id: number): Promise<Category> => {
    const response = await api.get<Category>(`/Categories/${id}`);
    return response.data;
  },

  // Создать новую категорию
  createCategory: async (category: { name: string, description: string }): Promise<Category> => {
    const response = await api.post<Category>('/Categories', category);
    return response.data;
  },

  // Обновить существующую категорию
  updateCategory: async (id: number, category: { name: string, description: string }): Promise<Category> => {
    const response = await api.put<Category>(`/Categories/${id}`, category);
    return response.data;
  },

  // Удалить категорию
  deleteCategory: async (id: number): Promise<void> => {
    await api.delete(`/Categories/${id}`);
  }
}; 