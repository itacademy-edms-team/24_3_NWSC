import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Alert, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getAdminStats } from '../../services/adminService';
import { AdminStats } from '../../types/admin';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const data = await getAdminStats();
        setStats(data);
        setError(null);
      } catch (error: any) {
        console.error('Ошибка загрузки статистики:', error);
        setError('Не удалось загрузить статистику');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Панель администратора</h1>
      
      {/* Общая статистика */}
      <Row className="mb-4">
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-primary">
                <i className="bi bi-people"></i> Пользователи
              </Card.Title>
              <h3>{stats?.totalUsers}</h3>
              <Card.Text className="text-muted">
                Заблокировано: {stats?.blockedUsers}
              </Card.Text>
              <Link to="/admin/users" className="btn btn-outline-primary btn-sm">
                Управлять
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-success">
                <i className="bi bi-newspaper"></i> Статьи
              </Card.Title>
              <h3>{stats?.totalArticles}</h3>
              <Card.Text className="text-muted">
                Новых сегодня: {stats?.newArticlesToday}
              </Card.Text>
              <Link to="/admin/articles" className="btn btn-outline-success btn-sm">
                Модерировать
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-info">
                <i className="bi bi-chat-dots"></i> Комментарии
              </Card.Title>
              <h3>{stats?.totalComments}</h3>
              <Card.Text className="text-muted">
                Новых сегодня: {stats?.newCommentsToday}
              </Card.Text>
              <Link to="/admin/comments" className="btn btn-outline-info btn-sm">
                Модерировать
              </Link>
            </Card.Body>
          </Card>
        </Col>
        
        <Col md={3}>
          <Card className="text-center">
            <Card.Body>
              <Card.Title className="text-warning">
                <i className="bi bi-person-plus"></i> Новые пользователи
              </Card.Title>
              <h3>{stats?.newUsersToday}</h3>
              <Card.Text className="text-muted">
                За сегодня
              </Card.Text>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      
      {/* Статистика по категориям */}
      <Row>
        <Col md={12}>
          <Card>
            <Card.Header>
              <h5>Статистика по категориям</h5>
            </Card.Header>
            <Card.Body>
              {stats?.categoryStats && stats.categoryStats.length > 0 ? (
                <div>
                  {stats.categoryStats.map(category => (
                    <div key={category.id} className="d-flex justify-content-between align-items-center mb-2">
                      <span>{category.name}</span>
                      <span className="badge bg-primary">{category.articlesCount} статей</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted">Нет данных по категориям</p>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default AdminDashboard; 