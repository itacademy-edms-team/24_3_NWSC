import React, { useState, useEffect } from 'react';
import { Card, Button, Row, Col, Nav, Tab, Alert, Container } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { getArticles } from '../services/articleService';
import { Article, User } from '../types/models';
import ArticleCard from '../components/ArticleCard';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [userArticles, setUserArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Проверка авторизации
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/profile' } } });
      return;
    }

    const currentUser = authService.getCurrentUser();
    setUser(currentUser);

    // Загрузка статей пользователя
    const fetchUserArticles = async () => {
      try {
        setLoading(true);
        // Получаем все статьи с сервера и фильтруем по ID автора
        const response = await getArticles(1, 100); // Получаем максимум 100 статей
        const filteredArticles = response.articles.filter(
          article => article.authorId === currentUser?.email
        );
        setUserArticles(filteredArticles);
      } catch (error) {
        console.error('Ошибка загрузки статей:', error);
        setError('Не удалось загрузить статьи пользователя');
      } finally {
        setLoading(false);
      }
    };

    fetchUserArticles();
  }, [navigate]);

  const handleLogout = () => {
    authService.logout().then(() => {
      navigate('/');
    });
  };

  if (!user) {
    return (
      <Container className="py-4">
        <Alert variant="warning">
          Необходимо войти в систему для просмотра профиля.
        </Alert>
        <Link to="/login" className="btn btn-primary">
          Войти
        </Link>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Профиль пользователя</h1>
      
      <Row>
        <Col md={4}>
          <Card className="mb-4">
            <Card.Body>
              <div className="text-center mb-3">
                <div className="avatar-placeholder mb-3">
                  <i className="bi bi-person-circle" style={{ fontSize: '5rem' }}></i>
                </div>
                <h2>{`${user.firstName} ${user.lastName}`}</h2>
                <p className="text-muted">{user.email}</p>
              </div>
              
              <div className="d-grid gap-2">
                <Button variant="outline-primary">
                  Редактировать профиль
                </Button>
                <Button variant="outline-danger" onClick={handleLogout}>
                  Выйти
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={8}>
          <Tab.Container defaultActiveKey="articles">
            <Card>
              <Card.Header>
                <Nav variant="tabs">
                  <Nav.Item>
                    <Nav.Link eventKey="articles">Мои статьи</Nav.Link>
                  </Nav.Item>
                  <Nav.Item>
                    <Nav.Link eventKey="stats">Статистика</Nav.Link>
                  </Nav.Item>
                </Nav>
              </Card.Header>
              
              <Card.Body>
                <Tab.Content>
                  <Tab.Pane eventKey="articles">
                    {loading ? (
                      <div className="text-center py-3">
                        <div className="spinner-border text-primary" role="status">
                          <span className="visually-hidden">Загрузка...</span>
                        </div>
                      </div>
                    ) : error ? (
                      <Alert variant="danger">{error}</Alert>
                    ) : userArticles.length === 0 ? (
                      <div className="text-center py-3">
                        <p>У вас пока нет опубликованных статей</p>
                        <Link to="/create-article" className="btn btn-primary">
                          Создать статью
                        </Link>
                      </div>
                    ) : (
                      <>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                          <h3>Ваши статьи ({userArticles.length})</h3>
                          <Link to="/create-article" className="btn btn-primary">
                            Создать статью
                          </Link>
                        </div>
                        
                        <Row xs={1} md={2} className="g-4">
                          {userArticles.map(article => (
                            <Col key={article.id}>
                              <ArticleCard article={article} />
                            </Col>
                          ))}
                        </Row>
                      </>
                    )}
                  </Tab.Pane>
                  
                  <Tab.Pane eventKey="stats">
                    <h3>Статистика активности</h3>
                    <div className="stats-container p-3">
                      <Row className="text-center">
                        <Col>
                          <div className="stats-item">
                            <h4>{userArticles.length}</h4>
                            <p>Статей</p>
                          </div>
                        </Col>
                        <Col>
                          <div className="stats-item">
                            <h4>{userArticles.reduce((sum, article) => sum + article.viewCount, 0)}</h4>
                            <p>Просмотров</p>
                          </div>
                        </Col>
                        <Col>
                          <div className="stats-item">
                            <h4>{new Set(userArticles.flatMap(article => article.categories.map(c => c.id))).size}</h4>
                            <p>Категорий</p>
                          </div>
                        </Col>
                        <Col>
                          <div className="stats-item">
                            <h4>{new Set(userArticles.flatMap(article => article.tags.map(t => t.id))).size}</h4>
                            <p>Тегов</p>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Tab.Pane>
                </Tab.Content>
              </Card.Body>
            </Card>
          </Tab.Container>
        </Col>
      </Row>
    </Container>
  );
};

export default ProfilePage; 