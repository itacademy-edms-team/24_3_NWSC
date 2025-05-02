import api from './api';
import { ArticleLike, CommentLike, CreateArticleLikeDto, CreateCommentLikeDto } from '../types/models';

// Включаем логирование
const DEBUG = true;

// Получить информацию о лайках статьи
export const getArticleLikes = async (articleId: number, page = 1, pageSize = 10): Promise<ArticleLike[]> => {
  try {
    if (DEBUG) console.log(`Получение лайков статьи ${articleId}, страница ${page}`);
    const params = { page, pageSize };
    const response = await api.get<ArticleLike[]>(`/Likes/Article/${articleId}`, { params });
    if (DEBUG) console.log(`Получено ${response.data.length} лайков для статьи ${articleId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при получении лайков статьи ${articleId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Получить количество лайков статьи
export const getArticleLikesCount = async (articleId: number): Promise<number> => {
  try {
    if (DEBUG) console.log(`Получение количества лайков статьи ${articleId}`);
    const response = await api.get<number>(`/Likes/Article/${articleId}/Count`);
    if (DEBUG) console.log(`Статья ${articleId} имеет ${response.data} лайков`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при получении количества лайков статьи ${articleId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Проверить, поставил ли текущий пользователь лайк статье
export const hasUserLikedArticle = async (articleId: number): Promise<boolean> => {
  try {
    if (DEBUG) console.log(`Проверка, поставил ли пользователь лайк статье ${articleId}`);
    const response = await api.get<boolean>(`/Likes/Article/${articleId}/HasLiked`);
    if (DEBUG) console.log(`Пользователь ${response.data ? 'поставил' : 'не поставил'} лайк статье ${articleId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при проверке, поставил ли пользователь лайк статье ${articleId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    // В случае ошибки считаем, что пользователь не лайкал статью
    return false;
  }
};

// Поставить лайк статье
export const likeArticle = async (articleId: number): Promise<ArticleLike> => {
  try {
    if (DEBUG) console.log(`Постановка лайка статье ${articleId}`);
    const dto: CreateArticleLikeDto = {
      userId: '', // Будет заполнено на сервере из токена
      articleId: articleId
    };
    const response = await api.post<ArticleLike>('/Likes/Article', dto);
    if (DEBUG) console.log(`Лайк статье ${articleId} успешно поставлен`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при постановке лайка статье ${articleId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Убрать лайк со статьи
export const unlikeArticle = async (articleId: number): Promise<void> => {
  try {
    if (DEBUG) console.log(`Удаление лайка со статьи ${articleId}`);
    await api.delete(`/Likes/Article/${articleId}`);
    if (DEBUG) console.log(`Лайк со статьи ${articleId} успешно удален`);
  } catch (error: any) {
    console.error(`Ошибка при удалении лайка со статьи ${articleId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Получить информацию о лайках комментария
export const getCommentLikes = async (commentId: number, page = 1, pageSize = 10): Promise<CommentLike[]> => {
  try {
    if (DEBUG) console.log(`Получение лайков комментария ${commentId}`);
    const params = { page, pageSize };
    const response = await api.get<CommentLike[]>(`/Likes/Comment/${commentId}`, { params });
    if (DEBUG) console.log(`Получено ${response.data.length} лайков для комментария ${commentId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при получении лайков комментария ${commentId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Получить количество лайков комментария
export const getCommentLikesCount = async (commentId: number): Promise<number> => {
  try {
    if (DEBUG) console.log(`Получение количества лайков комментария ${commentId}`);
    const response = await api.get<number>(`/Likes/Comment/${commentId}/Count`);
    if (DEBUG) console.log(`Комментарий ${commentId} имеет ${response.data} лайков`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при получении количества лайков комментария ${commentId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Проверить, поставил ли текущий пользователь лайк комментарию
export const hasUserLikedComment = async (commentId: number): Promise<boolean> => {
  try {
    if (DEBUG) console.log(`Проверка, поставил ли пользователь лайк комментарию ${commentId}`);
    const response = await api.get<boolean>(`/Likes/Comment/${commentId}/HasLiked`);
    if (DEBUG) console.log(`Пользователь ${response.data ? 'поставил' : 'не поставил'} лайк комментарию ${commentId}`);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при проверке, поставил ли пользователь лайк комментарию ${commentId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    // В случае ошибки считаем, что пользователь не лайкал комментарий
    return false;
  }
};

// Поставить лайк комментарию
export const likeComment = async (commentId: number): Promise<CommentLike> => {
  try {
    if (DEBUG) console.log(`Постановка лайка комментарию ${commentId}`);
    const dto: CreateCommentLikeDto = {
      userId: '', // Будет заполнено на сервере из токена
      commentId: commentId
    };
    const response = await api.post<CommentLike>('/Likes/Comment', dto);
    if (DEBUG) console.log(`Лайк комментарию ${commentId} успешно поставлен`, response.data);
    return response.data;
  } catch (error: any) {
    console.error(`Ошибка при постановке лайка комментарию ${commentId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};

// Убрать лайк с комментария
export const unlikeComment = async (commentId: number): Promise<void> => {
  try {
    if (DEBUG) console.log(`Удаление лайка с комментария ${commentId}`);
    await api.delete(`/Likes/Comment/${commentId}`);
    if (DEBUG) console.log(`Лайк с комментария ${commentId} успешно удален`);
  } catch (error: any) {
    console.error(`Ошибка при удалении лайка с комментария ${commentId}:`, error);
    if (error.response) {
      console.error('Ответ сервера:', error.response.data);
      console.error('Статус ответа:', error.response.status);
    }
    throw error;
  }
};