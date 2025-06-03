import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Pagination, InputGroup, FormControl, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getArticlesForModeration, deleteArticleAdmin } from '../../services/adminService';
import { ArticleList, Article } from '../../types/models';

const ArticleModeration: React.FC = () => {
  const [articleList, setArticleList] = useState<ArticleList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  const fetchArticles = async (page = 1, search = '') => {
    try {
      setLoading(true);
      const data = await getArticlesForModeration(page, 10, search);
      setArticleList(data);
      setError(null);
    } catch (error: any) {
      console.error('Ошибка загрузки статей:', error);
      setError('Не удалось загрузить статьи');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchArticles(1, searchTerm);
  };

  const handleDeleteArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedArticle) return;

    try {
      await deleteArticleAdmin(selectedArticle.id);
      setShowDeleteModal(false);
      await fetchArticles(currentPage, searchTerm);
    } catch (error: any) {
      setError('Не удалось удалить статью');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text: string, maxLength = 100) => {
    const cleanText = text.replace(/<[^>]*>/g, '');
    return cleanText.length > maxLength ? `${cleanText.substring(0, maxLength)}...` : cleanText;
  };

  if (loading && !articleList) {
    return (
      <Container className="py-4 text-center">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Модерация статей</h1>
        <Link to="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Назад к панели
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Поиск */}
      <form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <FormControl
            placeholder="Поиск по заголовку или содержанию..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="outline-secondary" type="submit">
            <i className="bi bi-search"></i> Найти
          </Button>
        </InputGroup>
      </form>
      
      {/* Таблица статей */}
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Заголовок</th>
            <th>Автор</th>
            <th>Дата создания</th>
            <th>Просмотры</th>
            <th>Категории</th>
            <th>Содержание</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {articleList?.articles.map(article => (
            <tr key={article.id}>
              <td>
                <Link to={`/articles/${article.id}`} target="_blank" className="text-decoration-none">
                  {article.title}
                </Link>
                {article.imagePaths && article.imagePaths.length > 0 && (
                  <Badge bg="info" className="ms-2">
                    <i className="bi bi-image"></i> {article.imagePaths.length}
                  </Badge>
                )}
              </td>
              <td>{article.authorName}</td>
              <td>{formatDate(article.createdAt)}</td>
              <td>
                <Badge bg="secondary">{article.viewCount}</Badge>
              </td>
              <td>
                {article.categories.map(category => (
                  <Badge key={category.id} bg="primary" className="me-1">
                    {category.name}
                  </Badge>
                ))}
              </td>
              <td>
                <small className="text-muted">
                  {truncateText(article.content)}
                </small>
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Link
                    to={`/articles/${article.id}`}
                    className="btn btn-outline-info btn-sm"
                    target="_blank"
                  >
                    <i className="bi bi-eye"></i> Просмотр
                  </Link>
                  <Link
                    to={`/edit-article/${article.id}`}
                    className="btn btn-outline-warning btn-sm"
                  >
                    <i className="bi bi-pencil"></i> Редактировать
                  </Link>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteArticle(article)}
                  >
                    <i className="bi bi-trash"></i> Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {articleList?.articles.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">Статьи не найдены</p>
        </div>
      )}
      
      {/* Пагинация */}
      {articleList && articleList.pageCount > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {Array.from({ length: articleList.pageCount }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === articleList.pageCount || 
              Math.abs(page - currentPage) <= 2
            )
            .map((page, index, array) => (
              <React.Fragment key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <Pagination.Ellipsis disabled />
                )}
                <Pagination.Item
                  active={page === currentPage}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Pagination.Item>
              </React.Fragment>
            ))}
          
          <Pagination.Next 
            onClick={() => setCurrentPage(currentPage + 1)}
            disabled={currentPage === articleList.pageCount}
          />
          <Pagination.Last 
            onClick={() => setCurrentPage(articleList.pageCount)}
            disabled={currentPage === articleList.pageCount}
          />
        </Pagination>
      )}
      
      {/* Модальное окно удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить статью</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            Вы уверены, что хотите удалить статью{' '}
            <strong>"{selectedArticle?.title}"</strong>?
          </p>
          <Alert variant="warning">
            <strong>Внимание!</strong> Это действие нельзя отменить. Будут также удалены все комментарии и лайки к статье.
          </Alert>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>
            Отмена
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Удалить
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default ArticleModeration; 