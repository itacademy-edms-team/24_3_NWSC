import React, { useState, useEffect } from 'react';
import { Container, Table, Button, Modal, Alert, Pagination, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { getCommentsForModeration, deleteCommentAdmin } from '../../services/adminService';
import { CommentList, Comment } from '../../types/models';

const CommentModeration: React.FC = () => {
  const [commentList, setCommentList] = useState<CommentList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);

  const fetchComments = async (page = 1) => {
    try {
      setLoading(true);
      const data = await getCommentsForModeration(page, 15);
      setCommentList(data);
      setError(null);
    } catch (error: any) {
      console.error('Ошибка загрузки комментариев:', error);
      setError('Не удалось загрузить комментарии');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments(currentPage);
  }, [currentPage]);

  const handleDeleteComment = (comment: Comment) => {
    setSelectedComment(comment);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!selectedComment) return;

    try {
      await deleteCommentAdmin(selectedComment.id);
      setShowDeleteModal(false);
      await fetchComments(currentPage);
    } catch (error: any) {
      setError('Не удалось удалить комментарий');
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

  const truncateText = (text: string, maxLength = 150) => {
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  if (loading && !commentList) {
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
        <h1>Модерация комментариев</h1>
        <Link to="/admin" className="btn btn-outline-secondary">
          <i className="bi bi-arrow-left"></i> Назад к панели
        </Link>
      </div>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      {/* Таблица комментариев */}
      <Table responsive striped bordered hover>
        <thead>
          <tr>
            <th>Комментарий</th>
            <th>Автор</th>
            <th>Статья</th>
            <th>Дата</th>
            <th>Лайки</th>
            <th>Тип</th>
            <th>Действия</th>
          </tr>
        </thead>
        <tbody>
          {commentList?.comments.map(comment => (
            <tr key={comment.id}>
              <td>
                <div className="comment-text">
                  {truncateText(comment.text)}
                </div>
              </td>
              <td>
                <div>
                  <strong>{comment.authorName}</strong>
                </div>
              </td>
              <td>
                <Link 
                  to={`/articles/${comment.articleId}`} 
                  target="_blank"
                  className="text-decoration-none"
                >
                  Перейти к статье
                </Link>
              </td>
              <td>
                <small>{formatDate(comment.createdAt)}</small>
                {comment.updatedAt && (
                  <div>
                    <small className="text-muted">
                      Изм.: {formatDate(comment.updatedAt)}
                    </small>
                  </div>
                )}
              </td>
              <td>
                <Badge bg="secondary">{comment.likesCount}</Badge>
              </td>
              <td>
                {comment.parentCommentId ? (
                  <Badge bg="info">Ответ</Badge>
                ) : (
                  <Badge bg="primary">Корневой</Badge>
                )}
              </td>
              <td>
                <div className="btn-group" role="group">
                  <Link
                    to={`/articles/${comment.articleId}#comment-${comment.id}`}
                    className="btn btn-outline-info btn-sm"
                    target="_blank"
                  >
                    <i className="bi bi-eye"></i> Просмотр
                  </Link>
                  <Button
                    variant="outline-danger"
                    size="sm"
                    onClick={() => handleDeleteComment(comment)}
                  >
                    <i className="bi bi-trash"></i> Удалить
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
      
      {commentList?.comments.length === 0 && (
        <div className="text-center py-4">
          <p className="text-muted">Комментарии не найдены</p>
        </div>
      )}
      
      {/* Пагинация */}
      {commentList && commentList.pageCount > 1 && (
        <Pagination className="justify-content-center">
          <Pagination.First 
            onClick={() => setCurrentPage(1)}
            disabled={currentPage === 1}
          />
          <Pagination.Prev 
            onClick={() => setCurrentPage(currentPage - 1)}
            disabled={currentPage === 1}
          />
          
          {Array.from({ length: commentList.pageCount }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === commentList.pageCount || 
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
            disabled={currentPage === commentList.pageCount}
          />
          <Pagination.Last 
            onClick={() => setCurrentPage(commentList.pageCount)}
            disabled={currentPage === commentList.pageCount}
          />
        </Pagination>
      )}
      
      {/* Модальное окно удаления */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Удалить комментарий</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Вы уверены, что хотите удалить этот комментарий?</p>
          {selectedComment && (
            <div className="bg-light p-3 rounded">
              <p><strong>Автор:</strong> {selectedComment.authorName}</p>
              <p><strong>Текст:</strong> {selectedComment.text}</p>
              <p><small className="text-muted">
                Дата: {formatDate(selectedComment.createdAt)}
              </small></p>
            </div>
          )}
          <Alert variant="warning" className="mt-3">
            <strong>Внимание!</strong> Это действие нельзя отменить. Если это корневой комментарий, будут также удалены все ответы на него.
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

export default CommentModeration; 