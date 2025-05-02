import React, { useState } from 'react';
import { Container, Card, Button, Alert, Form } from 'react-bootstrap';
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5181/api';

const ApiDebugPage: React.FC = () => {
  const [endpoint, setEndpoint] = useState('/health/ping');
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE'>('GET');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requestBody, setRequestBody] = useState('');
  
  const testEndpoints = [
    { name: 'Health Check', value: '/health/ping', method: 'GET' },
    { name: 'All Comments for Article 1', value: '/Comments/Article/1', method: 'GET' },
    { name: 'Create Comment', value: '/Comments', method: 'POST', body: '{\n  "text": "Test comment",\n  "authorId": "user@example.com",\n  "articleId": 1\n}' },
    { name: 'Article Likes Count', value: '/Likes/Article/1/Count', method: 'GET' },
    { name: 'Like Article', value: '/Likes/Article', method: 'POST', body: '{\n  "userId": "",\n  "articleId": 1\n}' },
  ];

  const handleEndpointSelect = (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE', body?: string) => {
    setEndpoint(endpoint);
    setMethod(method);
    setRequestBody(body || '');
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    
    try {
      const url = `${API_BASE_URL}${endpoint}`;
      const token = localStorage.getItem('token');
      
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      let response;
      
      switch (method) {
        case 'GET':
          response = await axios.get(url, { headers });
          break;
        case 'POST':
          response = await axios.post(url, requestBody ? JSON.parse(requestBody) : {}, { headers });
          break;
        case 'PUT':
          response = await axios.put(url, requestBody ? JSON.parse(requestBody) : {}, { headers });
          break;
        case 'DELETE':
          response = await axios.delete(url, { headers });
          break;
      }
      
      setResponse({
        status: response.status,
        statusText: response.statusText,
        data: response.data,
        headers: response.headers,
      });
    } catch (err: any) {
      console.error('API Debug Error:', err);
      
      setError(
        `Ошибка: ${err.message}\n` +
        (err.response 
          ? `Статус: ${err.response.status} ${err.response.statusText}\n` +
            `Данные: ${JSON.stringify(err.response.data, null, 2)}`
          : 'Нет ответа от сервера')
      );
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Container className="py-4">
      <h1 className="mb-4">Отладка API</h1>
      
      <Card className="mb-4">
        <Card.Body>
          <h5>Тестовые эндпоинты</h5>
          <div className="d-flex flex-wrap gap-2 mb-3">
            {testEndpoints.map((ep, index) => (
              <Button 
                key={index} 
                variant="outline-primary" 
                size="sm"
                onClick={() => handleEndpointSelect(ep.value, ep.method as any, ep.body)}
              >
                {ep.name} ({ep.method})
              </Button>
            ))}
          </div>
          
          <Form>
            <Form.Group className="mb-3">
              <Form.Label>URL эндпоинта</Form.Label>
              <Form.Control
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="/path/to/endpoint"
              />
              <Form.Text className="text-muted">
                Например: /Comments/Article/1
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3">
              <Form.Label>Метод</Form.Label>
              <Form.Select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
              </Form.Select>
            </Form.Group>
            
            {(method === 'POST' || method === 'PUT') && (
              <Form.Group className="mb-3">
                <Form.Label>JSON тело запроса</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  placeholder='{"key": "value"}'
                />
              </Form.Group>
            )}
            
            <Button
              variant="primary"
              onClick={handleSubmit}
              disabled={loading}
            >
              {loading ? 'Отправка...' : 'Отправить запрос'}
            </Button>
          </Form>
        </Card.Body>
      </Card>
      
      {error && (
        <Alert variant="danger" className="mb-4">
          <h5>Ошибка запроса</h5>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </Alert>
      )}
      
      {response && (
        <Card>
          <Card.Header>
            <strong>Ответ от сервера</strong> - Статус: {response.status} {response.statusText}
          </Card.Header>
          <Card.Body>
            <h5>Данные</h5>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(response.data, null, 2)}
            </pre>
            
            <h5 className="mt-4">Заголовки</h5>
            <pre style={{ whiteSpace: 'pre-wrap' }}>
              {JSON.stringify(response.headers, null, 2)}
            </pre>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default ApiDebugPage; 