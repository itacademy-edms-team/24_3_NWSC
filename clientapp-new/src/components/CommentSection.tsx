import React, { useState, useEffect } from 'react';
import { Card, Form, Button, Alert, Spinner } from 'react-bootstrap';
import { Comment, CreateCommentDto } from '../types/models';
import { getArticleComments, createComment } from '../services/commentService';
import { authService } from '../services/authService';
import CommentItem from './CommentItem';

interface CommentSectionProps {
  articleId: number;
}

const CommentSection: React.FC<CommentSectionProps> = ({ articleId }) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [debug, setDebug] = useState<any>(null);
  
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();

  useEffect(() => {
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      
      try {
        console.log(`Fetching comments for article ID: ${articleId}`);
        const response = await getArticleComments(articleId);
        console.log('Comments response:', response);
        
        if (response && Array.isArray(response.comments)) {
          setComments(response.comments);
          setTotalCount(response.totalCount || 0);
        } else {
          console.warn('Unexpected comments response format:', response);
          setDebug(response);
          setComments([]);
          setTotalCount(0);
        }
      } catch (error: any) {
        console.error('Ошибка при загрузке комментариев:', error);
        setError(`Не удалось загрузить комментарии: ${error.message}`);
        if (error.response) {
          console.error('Response data:', error.response.data);
          console.error('Response status:', error.response.status);
          setDebug({
            message: error.message,
            status: error.response.status,
            data: error.response.data
          });
        }
      } finally {
        setLoading(false);
      }
    };
    
    if (articleId) {
      fetchComments();
    }
  }, [articleId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated || !newComment.trim() || !currentUser) {
      return;
    }
    
    setSubmitting(true);
    setError(null);
    setDebug(null);
    
    try {
      console.log('Creating comment with data:', {
        text: newComment,
        authorId: currentUser.email,
        articleId
      });
      
      const commentDto: CreateCommentDto = {
        text: newComment,
        authorId: currentUser.email,
        articleId: articleId
      };
      
      const createdComment = await createComment(commentDto);
      console.log('Created comment:', createdComment);
      
      setComments(prev => [createdComment, ...prev]);
      setTotalCount(prev => prev + 1);
      setNewComment('');
    } catch (error: any) {
      console.error('Ошибка при добавлении комментария:', error);
      
      let errorMessage = 'Не удалось добавить комментарий. Пожалуйста, попробуйте позже.';
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
        
        setDebug({
          message: error.message,
          status: error.response.status,
          data: error.response.data
        });
        
        if (typeof error.response.data === 'string') {
          errorMessage = error.response.data;
        } else if (error.response.data && error.response.data.message) {
          errorMessage = error.response.data.message;
        }
      } else {
        errorMessage = `Ошибка: ${error.message}`;
      }
      
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCommentUpdate = (updatedComment: Comment) => {
    setComments(prev => 
      prev.map(comment => 
        comment.id === updatedComment.id 
          ? updatedComment 
          : comment.replies && comment.replies.some(reply => reply.id === updatedComment.id)
            ? {
                ...comment,
                replies: comment.replies.map(reply => 
                  reply.id === updatedComment.id ? updatedComment : reply
                )
              }
            : comment
      )
    );
  };

  const handleCommentDelete = (commentId: number) => {
    // Функция для проверки и удаления комментария из иерархии
    const removeComment = (comments: Comment[]): Comment[] => {
      return comments
        .filter(comment => comment.id !== commentId)
        .map(comment => {
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              replies: removeComment(comment.replies)
            };
          }
          return comment;
        });
    };
    
    setComments(prev => removeComment(prev));
    setTotalCount(prev => prev - 1);
  };

  const handleCommentAdd = (newComment: Comment) => {
    // Функция для добавления нового ответа на комментарий
    if (!newComment.parentCommentId) {
      // Если это комментарий верхнего уровня, добавляем его в начало списка
      setComments(prev => [newComment, ...prev]);
      setTotalCount(prev => prev + 1);
      return;
    }
    
    // Для ответов на комментариях, находим родительский комментарий и добавляем к нему ответ
    setComments(prev => 
      prev.map(comment => {
        if (comment.id === newComment.parentCommentId) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        
        // Проверяем вложенные комментарии
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = findAndAddReply(comment.replies, newComment);
          if (updatedReplies !== comment.replies) {
            return {
              ...comment,
              replies: updatedReplies
            };
          }
        }
        
        return comment;
      })
    );
    
    setTotalCount(prev => prev + 1);
  };

  // Вспомогательная функция для поиска родительского комментария и добавления к нему ответа
  const findAndAddReply = (replies: Comment[], newReply: Comment): Comment[] => {
    return replies.map(reply => {
      if (reply.id === newReply.parentCommentId) {
        return {
          ...reply,
          replies: [...(reply.replies || []), newReply]
        };
      }
      
      if (reply.replies && reply.replies.length > 0) {
        const updatedReplies = findAndAddReply(reply.replies, newReply);
        if (updatedReplies !== reply.replies) {
          return {
            ...reply,
            replies: updatedReplies
          };
        }
      }
      
      return reply;
    });
  };

  return (
    <div className="comment-section mt-5">
      <h3 className="mb-4">Комментарии ({totalCount})</h3>
      
      {isAuthenticated ? (
        <Card className="mb-4">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3" controlId="commentText">
                <Form.Label>Добавить комментарий</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Напишите ваш комментарий..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  required
                />
              </Form.Group>
              <Button 
                variant="primary" 
                type="submit" 
                disabled={submitting || !newComment.trim()}
              >
                {submitting ? 'Отправка...' : 'Отправить'}
              </Button>
              <Button 
                variant="link" 
                className="ms-2" 
                onClick={() => window.open('/api-debug', '_blank')}
              >
                Отладка API
              </Button>
            </Form>
          </Card.Body>
        </Card>
      ) : (
        <Alert variant="info" className="mb-4">
          <a href="/login">Войдите</a>, чтобы оставить комментарий
        </Alert>
      )}
      
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
          {debug && (
            <details className="mt-2">
              <summary>Техническая информация</summary>
              <pre style={{ whiteSpace: 'pre-wrap' }}>
                {JSON.stringify(debug, null, 2)}
              </pre>
            </details>
          )}
        </Alert>
      )}
      
      {loading ? (
        <div className="text-center py-4">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Загрузка комментариев...</span>
          </Spinner>
        </div>
      ) : comments.length > 0 ? (
        <div className="comments-list">
          {comments.map(comment => (
            <CommentItem
              key={comment.id}
              comment={comment}
              articleId={articleId}
              onCommentUpdate={handleCommentUpdate}
              onCommentDelete={handleCommentDelete}
              onCommentAdd={handleCommentAdd}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-muted mb-0">
            Пока нет комментариев. Будьте первым, кто оставит комментарий!
          </p>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 