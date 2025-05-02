import React, { useState } from 'react';
import { Container, Card, Form, Button, Alert, Tabs, Tab, Row, Col } from 'react-bootstrap';
import { LoginRequest } from '../types/models';
import axios from 'axios';

const AuthDebugPage: React.FC = () => {
  const [credentials, setCredentials] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [apiUrl, setApiUrl] = useState('http://localhost:5181/api/Auth/login');
  
  // Дополнительные настройки
  const [useCors, setUseCors] = useState(false);
  const [withCredentials, setWithCredentials] = useState(false);
  const [timeout, setTimeout] = useState(30000);
  const [additionalHeaders, setAdditionalHeaders] = useState('');
  const [requestMethod, setRequestMethod] = useState('post');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCredentials(prev => ({ ...prev, [name]: value }));
  };

  const handleApiUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiUrl(e.target.value);
  };

  const testConnectionDirect = async () => {
    setError(null);
    setApiResponse(null);
    setLoading(true);
    
    try {
      // Простой GET-запрос для проверки соединения
      const baseUrl = apiUrl.split('/api/')[0] || 'http://localhost:5181';
      const response = await axios.get(`${baseUrl}/api/health/ping`, {
        timeout: 5000
      });
      
      setApiResponse({
        message: 'Соединение успешно установлено!',
        details: response.data,
        status: response.status,
        headers: response.headers
      });
    } catch (error: any) {
      console.error('Test Connection Error:', error);
      setError(
        `Ошибка тестового соединения: ${error.message}. ${
          error.response 
            ? `Статус: ${error.response.status}, Данные: ${JSON.stringify(error.response.data)}` 
            : 'Нет ответа от сервера'
        }`
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setApiResponse(null);
    setLoading(true);

    try {
      // Подготовка заголовков
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      // Добавление дополнительных заголовков
      if (additionalHeaders.trim()) {
        try {
          const parsedHeaders = JSON.parse(additionalHeaders);
          Object.assign(headers, parsedHeaders);
        } catch (e) {
          console.warn('Не удалось разобрать дополнительные заголовки:', e);
        }
      }
      
      // Подготовка опций запроса
      const requestOptions: any = {
        headers,
        timeout,
        withCredentials
      };
      
      // Применение CORS прокси если выбрано
      const effectiveUrl = useCors 
        ? `https://cors-anywhere.herokuapp.com/${apiUrl}`
        : apiUrl;
      
      console.log('Отправка запроса:', {
        url: effectiveUrl,
        method: requestMethod,
        data: credentials,
        options: requestOptions
      });
      
      // Выполнение запроса с выбранным методом
      let response;
      if (requestMethod === 'post') {
        response = await axios.post(effectiveUrl, credentials, requestOptions);
      } else if (requestMethod === 'get') {
        response = await axios.get(effectiveUrl, {
          ...requestOptions,
          params: credentials
        });
      } else {
        throw new Error(`Неподдерживаемый метод запроса: ${requestMethod}`);
      }
      
      setApiResponse(response.data);
      
      // Если ответ успешный, сохраняем токен
      if (response.data && response.data.token) {
        localStorage.setItem('token', response.data.token);
        
        if (response.data.user) {
          localStorage.setItem('userId', response.data.user.email);
          localStorage.setItem('userName', `${response.data.user.firstName} ${response.data.user.lastName}`);
          localStorage.setItem('user', JSON.stringify(response.data.user));
        }
      }
    } catch (error: any) {
      console.error('API Error:', error);
      
      const errorDetails = {
        message: error.message,
        config: error.config ? {
          url: error.config.url,
          method: error.config.method,
          timeout: error.config.timeout,
          headers: error.config.headers
        } : 'Нет данных о конфигурации',
        response: error.response ? {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data
        } : 'Нет ответа от сервера'
      };
      
      setError(
        `Ошибка API: ${error.message}\n\nДетали:\n${JSON.stringify(errorDetails, null, 2)}`
      );
    } finally {
      setLoading(false);
    }
  };

  const clearLocalStorage = () => {
    localStorage.clear();
    alert('LocalStorage очищен');
  };

  const checkLocalStorage = () => {
    const storage = { ...localStorage };
    setApiResponse(storage);
  };

  return (
    <Container className="py-4">
      <h1 className="mb-4">Расширенная отладка авторизации</h1>
      
      <Row className="mb-4">
        <Col>
          <Button 
            variant="info" 
            className="me-2" 
            onClick={testConnectionDirect}
            disabled={loading}
          >
            Проверить соединение с сервером
          </Button>
          <Button 
            variant="secondary" 
            className="me-2" 
            onClick={checkLocalStorage}
          >
            Проверить localStorage
          </Button>
          <Button 
            variant="danger" 
            onClick={clearLocalStorage}
          >
            Очистить localStorage
          </Button>
        </Col>
      </Row>
      
      <Tabs defaultActiveKey="api" className="mb-4">
        <Tab eventKey="api" title="API-запрос">
          <Card>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Row>
                  <Col md={6}>
                    <Form.Group className="mb-3" controlId="apiUrl">
                      <Form.Label>URL API</Form.Label>
                      <Form.Control
                        type="text"
                        value={apiUrl}
                        onChange={handleApiUrlChange}
                        required
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3" controlId="email">
                      <Form.Label>Email</Form.Label>
                      <Form.Control
                        type="email"
                        name="email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
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
                      />
                    </Form.Group>
                  </Col>
                  
                  <Col md={6}>
                    <Form.Group className="mb-3">
                      <Form.Label>Метод запроса</Form.Label>
                      <Form.Select 
                        value={requestMethod} 
                        onChange={(e) => setRequestMethod(e.target.value)}
                      >
                        <option value="post">POST</option>
                        <option value="get">GET</option>
                      </Form.Select>
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Таймаут (мс)</Form.Label>
                      <Form.Control
                        type="number"
                        value={timeout}
                        onChange={(e) => setTimeout(parseInt(e.target.value))}
                        min={1000}
                        max={60000}
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Label>Дополнительные заголовки (JSON)</Form.Label>
                      <Form.Control
                        as="textarea"
                        rows={3}
                        value={additionalHeaders}
                        onChange={(e) => setAdditionalHeaders(e.target.value)}
                        placeholder='{"X-Custom-Header": "value"}'
                      />
                    </Form.Group>
                    
                    <Form.Group className="mb-3">
                      <Form.Check 
                        type="checkbox"
                        id="use-cors-proxy"
                        label="Использовать CORS-прокси"
                        checked={useCors}
                        onChange={(e) => setUseCors(e.target.checked)}
                      />
                      <Form.Check 
                        type="checkbox"
                        id="with-credentials"
                        label="With Credentials (для cookies)"
                        checked={withCredentials}
                        onChange={(e) => setWithCredentials(e.target.checked)}
                      />
                    </Form.Group>
                  </Col>
                </Row>
                
                <Button variant="primary" type="submit" disabled={loading}>
                  {loading ? 'Отправка запроса...' : 'Отправить запрос'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Tab>
        
        <Tab eventKey="help" title="Инструкция по отладке">
          <Card>
            <Card.Body>
              <h4>Порядок действий при отладке авторизации:</h4>
              <ol>
                <li>Убедитесь, что бэкенд запущен и доступен (кнопка "Проверить соединение")</li>
                <li>Проверьте формат запроса авторизации и URL</li>
                <li>При ошибке "Network Error" попробуйте:
                  <ul>
                    <li>Увеличить таймаут запроса</li>
                    <li>Использовать CORS-прокси (временное решение)</li>
                    <li>Убедиться, что сервер настроен для принятия запросов с вашего домена</li>
                  </ul>
                </li>
                <li>При ошибке авторизации проверьте:
                  <ul>
                    <li>Правильность учетных данных</li>
                    <li>Формат запроса (в соответствии с API)</li>
                    <li>Заголовки запроса</li>
                  </ul>
                </li>
              </ol>
              
              <h5>Настройка CORS на бэкенде (ASP.NET Core):</h5>
              <pre className="bg-light p-2">
{`// В Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("ReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

// И затем
app.UseCors("ReactApp");`}
              </pre>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <details open>
            <summary>Ошибка</summary>
            <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
          </details>
        </Alert>
      )}
      
      {apiResponse && (
        <Card>
          <Card.Header>Ответ</Card.Header>
          <Card.Body>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(apiResponse, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default AuthDebugPage; 