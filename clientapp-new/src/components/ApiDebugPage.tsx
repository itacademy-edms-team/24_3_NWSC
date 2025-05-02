import React, { useState, useEffect } from 'react';
import { Container, Form, Button, Card, Accordion, Alert } from 'react-bootstrap';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const ApiDebugPage: React.FC = () => {
  const [endpoint, setEndpoint] = useState<string>('');
  const [method, setMethod] = useState<string>('GET');
  const [requestBody, setRequestBody] = useState<string>('');
  const [authToken, setAuthToken] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const location = useLocation();
  const navigate = useNavigate();

  // Загружаем параметры из sessionStorage при монтировании
  useEffect(() => {
    const storedEndpoint = sessionStorage.getItem('debug_endpoint');
    const storedMethod = sessionStorage.getItem('debug_method');
    const storedBody = sessionStorage.getItem('debug_body');
    const storedToken = sessionStorage.getItem('debug_auth_token');

    if (storedEndpoint) {
      setEndpoint(storedEndpoint);
      sessionStorage.removeItem('debug_endpoint');
    }
    
    if (storedMethod) {
      setMethod(storedMethod);
      sessionStorage.removeItem('debug_method');
    }
    
    if (storedBody) {
      setRequestBody(storedBody);
      sessionStorage.removeItem('debug_body');
    }
    
    if (storedToken) {
      setAuthToken(storedToken);
      sessionStorage.removeItem('debug_auth_token');
    } else {
      // Если токен не передан, берем из localStorage
      const token = localStorage.getItem('token');
      if (token) {
        setAuthToken(token);
      }
    }
  }, []);

  const formatJson = (jsonStr: string): string => {
    try {
      return JSON.stringify(JSON.parse(jsonStr), null, 2);
    } catch (e) {
      return jsonStr;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResponse(null);

    try {
      // Формирование заголовков
      const headers: any = {
        'Content-Type': 'application/json',
      };

      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      // Базовый URL API
      const apiUrl = 'http://localhost:5181/api';
      const fullUrl = `${apiUrl}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;

      // Формирование параметров запроса
      const config = {
        headers,
        validateStatus: () => true, // Возвращаем true для всех кодов статуса, чтобы перехватывать и показывать ошибки
      };

      let result;

      // Выполнение запроса в зависимости от метода
      switch (method) {
        case 'GET':
          result = await axios.get(fullUrl, config);
          break;
        case 'POST':
          const postData = requestBody ? JSON.parse(requestBody) : {};
          result = await axios.post(fullUrl, postData, config);
          break;
        case 'PUT':
          const putData = requestBody ? JSON.parse(requestBody) : {};
          result = await axios.put(fullUrl, putData, config);
          break;
        case 'DELETE':
          result = await axios.delete(fullUrl, config);
          break;
        default:
          throw new Error(`Неподдерживаемый метод: ${method}`);
      }

      // Устанавливаем ответ
      setResponse({
        status: result.status,
        statusText: result.statusText,
        data: result.data,
        headers: result.headers,
      });
    } catch (err: any) {
      console.error('Ошибка при выполнении запроса:', err);
      setError(err.message || 'Произошла ошибка при выполнении запроса');
      
      // Если есть ответ от сервера, показываем его
      if (err.response) {
        setResponse({
          status: err.response.status,
          statusText: err.response.statusText,
          data: err.response.data,
          headers: err.response.headers,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setRequestBody(e.target.value);
  };

  const handleEndpointChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEndpoint(e.target.value);
  };

  const handleMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setMethod(e.target.value);
  };

  const handleTokenChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setAuthToken(e.target.value);
  };

  // Предустановленные запросы для быстрого тестирования
  const presetRequests = [
    { name: 'Здоровье API', endpoint: '/health/ping', method: 'GET' },
    { name: 'Расширенная проверка', endpoint: '/health/check', method: 'GET' },
    { name: 'Список статей', endpoint: '/Articles', method: 'GET' },
    { name: 'Лайки статьи', endpoint: '/Likes/Article/1/Count', method: 'GET' },
    { name: 'Проверить лайк статьи', endpoint: '/Likes/Article/1/HasLiked', method: 'GET' },
    { name: 'Лайки комментария', endpoint: '/Likes/Comment/1/Count', method: 'GET' },
    { name: 'Комментарии статьи', endpoint: '/Comments/Article/1', method: 'GET' },
    { name: 'Отладка пользователя', endpoint: '/Likes/Debug', method: 'GET' },
  ];

  const handlePresetClick = (preset: { endpoint: string; method: string }) => {
    setEndpoint(preset.endpoint);
    setMethod(preset.method);
    if (preset.method === 'GET' || preset.method === 'DELETE') {
      setRequestBody('');
    }
  };

  return (
    <Container className="py-4">
      <h1>Отладка API</h1>
      <p className="text-muted">
        Используйте эту страницу для тестирования API-запросов. 
        База URL: <code>http://localhost:5181/api</code>
      </p>

      <div className="mb-4">
        <h5>Быстрые тесты:</h5>
        <div className="d-flex flex-wrap gap-2">
          {presetRequests.map((preset, index) => (
            <Button 
              key={index} 
              variant="outline-secondary" 
              size="sm" 
              onClick={() => handlePresetClick(preset)}
            >
              {preset.name} ({preset.method})
            </Button>
          ))}
        </div>
      </div>

      <Form onSubmit={handleSubmit}>
        <div className="row mb-3">
          <div className="col-md-8">
            <Form.Group controlId="endpoint">
              <Form.Label>URL эндпоинта (без базового URL)</Form.Label>
              <Form.Control
                type="text"
                placeholder="/Likes/Article/1/Count"
                value={endpoint}
                onChange={handleEndpointChange}
                required
              />
              <Form.Text className="text-muted">
                Полный URL будет: http://localhost:5181/api{endpoint.startsWith('/') ? endpoint : '/' + endpoint}
              </Form.Text>
            </Form.Group>
          </div>
          <div className="col-md-4">
            <Form.Group controlId="method">
              <Form.Label>Метод</Form.Label>
              <Form.Select value={method} onChange={handleMethodChange}>
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Form.Select>
            </Form.Group>
          </div>
        </div>

        {(method === 'POST' || method === 'PUT') && (
          <Form.Group className="mb-3" controlId="requestBody">
            <Form.Label>Тело запроса (JSON)</Form.Label>
            <Form.Control
              as="textarea"
              rows={5}
              value={requestBody}
              onChange={handleBodyChange}
              placeholder='{"key": "value"}'
            />
          </Form.Group>
        )}

        <Form.Group className="mb-3" controlId="authToken">
          <Form.Label>Токен авторизации (JWT)</Form.Label>
          <Form.Control
            as="textarea"
            rows={2}
            value={authToken}
            onChange={handleTokenChange}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          />
          <Form.Text className="text-muted">
            Оставьте пустым для запросов без авторизации
          </Form.Text>
        </Form.Group>

        <Button variant="primary" type="submit" disabled={loading}>
          {loading ? 'Выполнение запроса...' : 'Выполнить запрос'}
        </Button>
      </Form>

      {error && (
        <Alert variant="danger" className="mt-4">
          <Alert.Heading>Ошибка!</Alert.Heading>
          <p>{error}</p>
        </Alert>
      )}

      {response && (
        <Card className="mt-4">
          <Card.Header>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Результат запроса</h5>
              <span className={`badge ${response.status >= 200 && response.status < 300 ? 'bg-success' : 'bg-danger'}`}>
                {response.status} {response.statusText}
              </span>
            </div>
          </Card.Header>
          <Card.Body>
            <Accordion defaultActiveKey="0">
              <Accordion.Item eventKey="0">
                <Accordion.Header>Данные</Accordion.Header>
                <Accordion.Body>
                  <pre className="bg-light p-3 border rounded">
                    {typeof response.data === 'object'
                      ? JSON.stringify(response.data, null, 2)
                      : response.data}
                  </pre>
                </Accordion.Body>
              </Accordion.Item>
              <Accordion.Item eventKey="1">
                <Accordion.Header>Заголовки</Accordion.Header>
                <Accordion.Body>
                  <pre className="bg-light p-3 border rounded">
                    {JSON.stringify(response.headers, null, 2)}
                  </pre>
                </Accordion.Body>
              </Accordion.Item>
            </Accordion>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ApiDebugPage; 