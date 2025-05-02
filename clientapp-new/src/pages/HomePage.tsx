import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Button, Alert } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getPopularArticles, getLatestArticles } from '../services/articleService';
import { checkServerHealth } from '../services/api';
import { Article } from '../types/models';
import ArticleCard from '../components/ArticleCard';

const HomePage: React.FC = () => {
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [latestArticles, setLatestArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [serverStatus, setServerStatus] = useState<'loading' | 'online' | 'offline'>('loading');
  const [error, setError] = useState<string | null>(null);

  // Проверка доступности сервера
  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const isServerAvailable = await checkServerHealth();
        
        if (isServerAvailable) {
          console.log('Сервер доступен');
          setServerStatus('online');
        } else {
          console.error('Сервер недоступен');
          setServerStatus('offline');
        }
      } catch (error) {
        console.error('Ошибка при проверке доступности сервера:', error);
        setServerStatus('offline');
      }
    };
    
    checkServerStatus();
    
    // Проверяем каждые 30 секунд
    const intervalId = setInterval(checkServerStatus, 30000);
    
    // Очистка при размонтировании
    return () => clearInterval(intervalId);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      if (serverStatus !== 'online') {
        setLoading(false);
        return;
      }
      
      try {
        const popular = await getPopularArticles(5); // Получаем 5 популярных статей
        const latest = await getLatestArticles(6); // Получаем 6 последних статей
        
        setPopularArticles(popular);
        setLatestArticles(latest);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, [serverStatus]);

  const renderServerStatus = () => {
    if (serverStatus === 'loading') {
      return <Alert variant="info">Проверка доступности сервера...</Alert>;
    } else if (serverStatus === 'offline') {
      return (
        <Alert variant="danger">
          <Alert.Heading>Сервер недоступен</Alert.Heading>
          <p>
            Не удалось подключиться к серверу API. Пожалуйста, убедитесь, что сервер запущен и работает на порту 5181.
          </p>
          <hr />
          <div className="d-flex justify-content-between">
            <Button variant="outline-danger" onClick={() => window.location.reload()}>
              Обновить страницу
            </Button>
            <Button 
              variant="outline-primary" 
              onClick={() => window.open('http://localhost:5181/api/health/ping', '_blank')}
            >
              Прямая проверка API
            </Button>
            <Link to="/auth-debug" className="btn btn-info">
              Перейти к отладке
            </Link>
          </div>
        </Alert>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        {renderServerStatus()}
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </div>
    );
  }

  if (serverStatus === 'offline') {
    return (
      <div className="py-5">
        {renderServerStatus()}
      </div>
    );
  }

  return (
    <div className="home-page">
      {serverStatus === 'online' && (
        <Alert variant="success" dismissible className="mb-4">
          Сервер доступен и работает нормально
        </Alert>
      )}
      
      <section className="welcome-section mb-5">
        <Card className="bg-dark text-white">
          <Card.Body className="text-center py-5">
            <h1 className="display-4">Добро пожаловать на новостной портал</h1>
            <p className="lead">Актуальные новости, интересные статьи и мнения экспертов</p>
            <Link to="/articles" className="btn btn-primary btn-lg mt-3">Все статьи</Link>
          </Card.Body>
        </Card>
      </section>

      <section className="popular-articles mb-5">
        <h2 className="section-title mb-4">Популярные статьи</h2>
        <Row>
          {popularArticles.length > 0 ? (
            popularArticles.map(article => (
              <Col md={4} key={article.id} className="mb-4">
                <ArticleCard article={article} />
              </Col>
            ))
          ) : (
            <Col>
              <Alert variant="info">
                Популярных статей пока нет
              </Alert>
            </Col>
          )}
        </Row>
        <div className="text-center mt-3">
          <Link to="/articles" className="btn btn-outline-primary">Смотреть все</Link>
        </div>
      </section>

      <section className="latest-articles">
        <h2 className="section-title mb-4">Последние публикации</h2>
        <Row>
          {latestArticles.length > 0 ? (
            latestArticles.map(article => (
              <Col md={4} key={article.id} className="mb-4">
                <ArticleCard article={article} />
              </Col>
            ))
          ) : (
            <Col>
              <Alert variant="info">
                Последних публикаций пока нет
              </Alert>
            </Col>
          )}
        </Row>
        <div className="text-center mt-3">
          <Link to="/articles" className="btn btn-outline-primary">Смотреть все</Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage; 