import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Badge, Button } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Article } from '../types/models';
import { articleService } from '../services/articleService';
import { authService } from '../services/authService';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  
  // Проверка, может ли пользователь редактировать статью
  const canEdit = isAuthenticated && article && (
    currentUser?.email === article.authorId || // Если пользователь автор статьи
    JSON.parse(localStorage.getItem('user_roles') || '[]').includes('Admin') // Или администратор
  );

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        const data = await articleService.getArticleById(parseInt(id));
        setArticle(data);
      } catch (err) {
        console.error('Ошибка загрузки статьи:', err);
        setError('Не удалось загрузить статью. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!id || !window.confirm('Вы уверены, что хотите удалить эту статью?')) {
      return;
    }
    
    try {
      setLoading(true);
      await articleService.deleteArticle(parseInt(id));
      navigate('/articles');
    } catch (err) {
      console.error('Ошибка удаления статьи:', err);
      setError('Не удалось удалить статью. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  // Форматируем дату создания
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Container className="my-4">
      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : !article ? (
        <div className="alert alert-info" role="alert">
          Статья не найдена
        </div>
      ) : (
        <>
          <div className="mb-4">
            <Link to="/articles" className="btn btn-outline-secondary">
              &laquo; Назад к списку статей
            </Link>
          </div>
          
          <article>
            <h1 className="mb-3">{article.title}</h1>
            
            <div className="d-flex justify-content-between text-muted mb-4">
              <div>
                <strong>Автор:</strong> {article.authorName}
              </div>
              <div>
                <strong>Опубликовано:</strong> {formatDate(article.createdAt)}
                {article.updatedAt && (
                  <span> (обновлено: {formatDate(article.updatedAt)})</span>
                )}
              </div>
            </div>
            
            <div className="mb-4">
              {article.categories.map(category => (
                <Link key={category.id} to={`/categories/${category.id}`}>
                  <Badge bg="primary" className="me-2 p-2 fs-6">
                    {category.name}
                  </Badge>
                </Link>
              ))}
              {article.tags.map(tag => (
                <Link key={tag.id} to={`/tags/${tag.id}`}>
                  <Badge bg="secondary" className="me-2 p-2 fs-6">
                    {tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
            
            <Row className="mb-4">
              <Col>
                <div className="article-content fs-5">
                  {article.content.split('\n').map((paragraph, idx) => (
                    <p key={idx}>{paragraph}</p>
                  ))}
                </div>
              </Col>
            </Row>
            
            <div className="mt-4 border-top pt-4 d-flex justify-content-between">
              <div>
                <Badge bg="info" className="p-2 fs-6">
                  <i className="bi bi-eye me-1"></i> Просмотров: {article.viewCount}
                </Badge>
              </div>
              
              {canEdit && (
                <div>
                  <Link to={`/articles/${article.id}/edit`} className="btn btn-primary me-2">
                    Редактировать
                  </Link>
                  <Button variant="danger" onClick={handleDelete}>
                    Удалить
                  </Button>
                </div>
              )}
            </div>
          </article>
        </>
      )}
    </Container>
  );
};

export default ArticleDetailPage; 