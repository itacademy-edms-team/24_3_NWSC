import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Badge, Button, Modal } from 'react-bootstrap';
import { getArticleById, deleteArticle } from '../services/articleService';
import { Article } from '../types/models';

const ArticleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  // Проверка, является ли текущий пользователь автором статьи
  const isAuthor = article?.authorId === localStorage.getItem('userId');

  useEffect(() => {
    const fetchArticle = async () => {
      if (!id) return;

      try {
        setLoading(true);
        const data = await getArticleById(parseInt(id, 10));
        setArticle(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching article:', error);
        setError('Не удалось загрузить статью. Проверьте ID или попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [id]);

  const handleDelete = async () => {
    if (!id) return;

    try {
      await deleteArticle(parseInt(id, 10));
      setShowDeleteModal(false);
      navigate('/articles');
    } catch (error) {
      console.error('Error deleting article:', error);
      setError('Не удалось удалить статью. Попробуйте позже.');
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (loading) {
    return <div className="text-center py-5">Загрузка...</div>;
  }

  if (error) {
    return (
      <div className="text-center py-5">
        <h3>Ошибка</h3>
        <p>{error}</p>
        <Link to="/articles" className="btn btn-primary">
          Вернуться к списку статей
        </Link>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="text-center py-5">
        <h3>Статья не найдена</h3>
        <p>Статья с указанным ID не существует</p>
        <Link to="/articles" className="btn btn-primary">
          Вернуться к списку статей
        </Link>
      </div>
    );
  }

  return (
    <div className="article-detail-page">
      <Card className="mb-4">
        <Card.Body>
          <h1 className="article-title mb-3">{article.title}</h1>
          
          <div className="article-meta mb-4">
            <div className="d-flex justify-content-between align-items-center flex-wrap">
              <div>
                <span className="text-muted me-3">
                  Автор: {article.authorName}
                </span>
                <span className="text-muted me-3">
                  Опубликовано: {formatDate(article.createdAt)}
                </span>
                {article.updatedAt && (
                  <span className="text-muted">
                    Обновлено: {formatDate(article.updatedAt)}
                  </span>
                )}
              </div>
              <div>
                <span className="text-muted">
                  <i className="bi bi-eye"></i> {article.viewCount} просмотров
                </span>
              </div>
            </div>
          </div>
          
          {article.categories.length > 0 && (
            <div className="article-categories mb-2">
              <strong>Категории: </strong>
              {article.categories.map(category => (
                <Link to={`/articles?category=${category.id}`} key={category.id}>
                  <Badge bg="primary" className="me-1">{category.name}</Badge>
                </Link>
              ))}
            </div>
          )}
          
          {article.tags.length > 0 && (
            <div className="article-tags mb-3">
              <strong>Теги: </strong>
              {article.tags.map(tag => (
                <Link to={`/articles?tag=${tag.id}`} key={tag.id}>
                  <Badge bg="secondary" className="me-1">{tag.name}</Badge>
                </Link>
              ))}
            </div>
          )}
          
          <hr className="my-4" />
          
          <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content }} />
          
          {isAuthor && (
            <div className="mt-4 d-flex">
              <Link to={`/edit-article/${article.id}`} className="btn btn-primary me-2">
                Редактировать
              </Link>
              <Button variant="danger" onClick={() => setShowDeleteModal(true)}>
                Удалить
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
      
      <Link to="/articles" className="btn btn-outline-primary">
        &larr; Назад к списку статей
      </Link>
      
      {/* Модальное окно подтверждения удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Подтверждение удаления</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Вы уверены, что хотите удалить статью "{article.title}"? Это действие нельзя будет отменить.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ArticleDetailPage; 