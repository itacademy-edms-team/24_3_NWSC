import api from './api';
import { Article, ArticleList, CreateArticleDto, UpdateArticleDto } from '../types/models';

// Получить список статей с пагинацией и поиском
export const getArticles = async (page = 1, pageSize = 10, search?: string): Promise<ArticleList> => {
  const params = { page, pageSize, search };
  const response = await api.get<ArticleList>('/Articles', { params });
  return response.data;
};

// Получить все статьи для ленточного режима
export const getAllArticlesForFeed = async (search?: string): Promise<Article[]> => {
  const params = { page: 1, pageSize: 1000, search }; // Большой pageSize для получения всех статей
  const response = await api.get<ArticleList>('/Articles', { params });
  return response.data.articles;
};

// Получить статью по ID
export const getArticleById = async (id: number): Promise<Article> => {
  const response = await api.get<Article>(`/Articles/${id}`);
  return response.data;
};

// Создать новую статью
export const createArticle = async (article: CreateArticleDto): Promise<Article> => {
  const formData = new FormData();
  formData.append('title', article.title);
  formData.append('content', article.content);
  formData.append('authorId', article.authorId);
  
  // Добавляем категории
  article.categoryIds.forEach((categoryId) => {
    formData.append('categoryIds', categoryId.toString());
  });
  
  // Добавляем теги
  article.tagIds.forEach((tagId) => {
    formData.append('tagIds', tagId.toString());
  });
  
  // Добавляем множественные изображения
  if (article.images && article.images.length > 0) {
    article.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  
  const response = await api.post<Article>('/Articles', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Обновить существующую статью
export const updateArticle = async (id: number, article: UpdateArticleDto): Promise<Article> => {
  const formData = new FormData();
  formData.append('title', article.title);
  formData.append('content', article.content);
  
  // Добавляем категории
  article.categoryIds.forEach((categoryId) => {
    formData.append('categoryIds', categoryId.toString());
  });
  
  // Добавляем теги
  article.tagIds.forEach((tagId) => {
    formData.append('tagIds', tagId.toString());
  });
  
  // Добавляем множественные изображения
  if (article.images && article.images.length > 0) {
    article.images.forEach((image) => {
      formData.append('images', image);
    });
  }
  
  const response = await api.put<Article>(`/Articles/${id}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Удалить статью
export const deleteArticle = async (id: number): Promise<void> => {
  await api.delete(`/Articles/${id}`);
};

// Получить популярные статьи
export const getPopularArticles = async (count: number = 5): Promise<Article[]> => {
  const params = { count };
  const response = await api.get<Article[]>('/Articles/Popular', { params });
  return response.data;
};

// Получить последние статьи
export const getLatestArticles = async (count: number = 6): Promise<Article[]> => {
  const params = { count };
  const response = await api.get<Article[]>('/Articles/Latest', { params });
  return response.data;
};

// Получить статьи по категории
export const getArticlesByCategory = async (categoryId: number, page = 1, pageSize = 10): Promise<ArticleList> => {
  const params = { page, pageSize };
  const response = await api.get<ArticleList>(`/Articles/Categories/${categoryId}`, { params });
  return response.data;
};

// Получить статьи по тегу
export const getArticlesByTag = async (tagId: number, page = 1, pageSize = 10): Promise<ArticleList> => {
  const params = { page, pageSize };
  const response = await api.get<ArticleList>(`/Articles/Tags/${tagId}`, { params });
  return response.data;
}; 