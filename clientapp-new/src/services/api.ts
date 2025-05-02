import axios from 'axios';

// Базовый URL для API
const API_URL = 'http://localhost:5181/api';

// Включить детальное логирование
const ENABLE_DEBUG = true;

// Создаем экземпляр axios с базовыми настройками
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Перехватчик для добавления токена авторизации
api.interceptors.request.use(
  config => {
    // Получаем токен из localStorage
    const token = localStorage.getItem('token');
    
    // Если токен существует, добавляем его в заголовок Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      
      if (ENABLE_DEBUG) {
        console.log('API запрос с токеном:', {
          url: config.url,
          method: config.method,
          tokenPreview: token.substring(0, 15) + '...' // Показываем только начало токена для безопасности
        });
      }
    } else if (ENABLE_DEBUG) {
      console.log('API запрос без токена:', {
        url: config.url,
        method: config.method
      });
    }
    
    return config;
  },
  error => {
    console.error('Ошибка в перехватчике запроса:', error);
    return Promise.reject(error);
  }
);

// Перехватчик для обработки ответов
api.interceptors.response.use(
  response => {
    if (ENABLE_DEBUG) {
      console.log('API ответ:', {
        url: response.config.url,
        status: response.status,
        statusText: response.statusText,
        data: response.data
      });
    }
    return response;
  },
  error => {
    if (ENABLE_DEBUG) {
      if (error.response) {
        console.error('API ошибка с ответом:', {
          url: error.config?.url,
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        });
      } else if (error.request) {
        console.error('API ошибка без ответа от сервера:', {
          url: error.config?.url,
          request: error.request
        });
      } else {
        console.error('Ошибка настройки запроса:', error.message);
      }
    }
    
    // Если ошибка 401 (Unauthorized), перенаправляем на страницу входа
    if (error.response && error.response.status === 401) {
      console.log('Получен статус 401, выполняем редирект на /login');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
      localStorage.removeItem('userName');
      
      // Используем window.location для принудительного перенаправления
      // (этот подход предпочтительнее, когда нужно полностью перезагрузить приложение)
      if (!window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register') &&
          !window.location.pathname.includes('/auth-debug')) {
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

export default api; 