import React, { useState } from 'react';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { LoginRequest } from '../types/models';
import { authService } from '../services/authService';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  
  // Получаем URL для перенаправления после успешной авторизации
  const from = location.state?.from?.pathname || '/';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setDebugInfo(null);
    setLoading(true);

    try {
      console.log('Авторизация с данными:', credentials);
      const response = await authService.login(credentials);
      console.log('Успешная авторизация, ответ:', response);
      
      // Выводим информацию о токене (только первые 20 символов)
      if (response.token) {
        const tokenPreview = response.token.substring(0, 20) + '...';
        console.log('Токен получен:', tokenPreview);
      }
      
      // Сохраняем информацию о пользователе в localStorage
      if (response.user) {
        console.log('Информация о пользователе:', response.user);
        
        // Сохранение информации о пользователе происходит в сервисе authService.login
        
        // Дополнительная проверка, что данные сохранились в localStorage
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');
        if (savedToken && savedUser) {
          console.log('Данные успешно сохранены в localStorage');
        } else {
          console.warn('Проблема с сохранением данных в localStorage');
        }
      }
      
      // Перенаправляем пользователя на предыдущую страницу или на главную
      console.log(`Перенаправление на: ${from}`);
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error('Ошибка авторизации:', error);
      
      let errorMessage = 'Ошибка при входе в систему. Проверьте email и пароль.';
      let debugMessage = null;
      
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
        console.error('Статус:', error.response.status);
        
        // Подробная информация об ошибке для отладки
        debugMessage = `Статус: ${error.response.status}\nДанные: ${JSON.stringify(error.response.data, null, 2)}`;
        
        // Попытка получить сообщение об ошибке из ответа сервера
        if (error.response.data) {
          if (typeof error.response.data === 'string') {
            errorMessage = error.response.data;
          } else if (error.response.data.message) {
            errorMessage = error.response.data.message;
          } else if (error.response.data.error) {
            errorMessage = error.response.data.error;
          }
        }
      } else if (error.message) {
        errorMessage = `Ошибка: ${error.message}`;
      }
      
      setError(errorMessage);
      setDebugInfo(debugMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow">
            <Card.Body className="p-4">
              <h2 className="text-center mb-4">Вход в систему</h2>
              
              {error && <Alert variant="danger">{error}</Alert>}
              
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={credentials.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                  />
                </Form.Group>
                
                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Пароль</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    value={credentials.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                  />
                </Form.Group>
                
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100" 
                  disabled={loading}
                >
                  {loading ? 'Выполняется вход...' : 'Войти'}
                </Button>
              </Form>
              
              <div className="text-center mt-3">
                <p>
                  Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
                </p>
                <p>
                  <Link to="/auth-debug">Отладка авторизации</Link>
                </p>
              </div>
              
              {/* Отладочная информация */}
              {debugInfo && (
                <div className="mt-4">
                  <details>
                    <summary>Отладочная информация</summary>
                    <pre className="bg-light p-3 mt-2" style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>
                      {debugInfo}
                    </pre>
                  </details>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default LoginPage; 