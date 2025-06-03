import api from './api';
import { AuthResponse, LoginRequest, RegisterRequest, User } from '../types/models';

// Функция для декодирования JWT токена
const decodeJWT = (token: string) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
      return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Ошибка декодирования JWT:', error);
    return null;
  }
};

export const authService = {
  // Авторизация пользователя
  login: async (credentials: LoginRequest): Promise<AuthResponse> => {
    try {
      console.log('Отправка запроса авторизации:', { url: '/Auth/login', credentials });
      const response = await api.post<AuthResponse>('/Auth/login', credentials);
      console.log('Ответ на запрос авторизации:', response.data);
      
      // Сохраняем токен в localStorage
      localStorage.setItem('token', response.data.token);
      
      // Декодируем токен для извлечения ролей
      const decodedToken = decodeJWT(response.data.token);
      if (decodedToken) {
        // Извлекаем роли из токена
        const roles = decodedToken.role || decodedToken['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] || [];
        const roleArray = Array.isArray(roles) ? roles : [roles];
        localStorage.setItem('user_roles', JSON.stringify(roleArray));
        console.log('Роли пользователя:', roleArray);
      }
      
      // Сохраняем данные пользователя
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        localStorage.setItem('userId', response.data.user.email);
        localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);
      }
      
      return response.data;
    } catch (error: any) {
      console.error('Ошибка авторизации:', error);
      console.error('Ответ сервера:', error.response?.data);
      console.error('Статус:', error.response?.status);
      throw error;
    }
  },

  // Регистрация нового пользователя
  register: async (user: RegisterRequest): Promise<{ message: string }> => {
    try {
      console.log('Отправка запроса регистрации:', { url: '/Auth/register', user });
      const response = await api.post<{ message: string }>('/Auth/register', user);
      console.log('Ответ на запрос регистрации:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('Ошибка регистрации:', error);
      console.error('Ответ сервера:', error.response?.data);
      console.error('Статус:', error.response?.status);
      throw error;
    }
  },

  // Выход пользователя
  logout: async (): Promise<void> => {
    try {
      await api.post('/Auth/logout');
    } catch (error) {
      console.error('Ошибка при выходе из системы:', error);
    } finally {
      // Удаляем данные из localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      localStorage.removeItem('user_roles');
    }
  },

  // Проверка, авторизован ли пользователь
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('token');
  },

  // Получить текущего пользователя
  getCurrentUser: (): User | null => {
    const userJson = localStorage.getItem('user');
    if (!userJson) return null;
    
    try {
      return JSON.parse(userJson);
    } catch (error) {
      console.error('Ошибка при чтении данных пользователя из localStorage:', error);
      return null;
    }
  },

  // Получить роли текущего пользователя
  getCurrentUserRoles: (): string[] => {
    const rolesJson = localStorage.getItem('user_roles');
    if (!rolesJson) return [];
    
    try {
      return JSON.parse(rolesJson);
    } catch (error) {
      console.error('Ошибка при чтении ролей пользователя из localStorage:', error);
      return [];
    }
  },

  // Проверить, является ли пользователь администратором
  isAdmin: (): boolean => {
    const roles = authService.getCurrentUserRoles();
    return roles.includes('Admin');
  },

  // Сохранить данные пользователя
  saveUser: (user: User): void => {
    try {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user.email);
      localStorage.setItem('userName', `${user.firstName} ${user.lastName}`);
    } catch (error) {
      console.error('Ошибка при сохранении данных пользователя в localStorage:', error);
    }
  }
}; 