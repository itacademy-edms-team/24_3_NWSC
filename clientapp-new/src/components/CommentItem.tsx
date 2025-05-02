import React, { useState } from 'react';
import { Card, Button, Form, Badge } from 'react-bootstrap';
import { Comment, UpdateCommentDto, CreateCommentDto } from '../types/models';
import { updateComment, deleteComment, createComment } from '../services/commentService';
import { authService } from '../services/authService';
import LikeButton from './LikeButton';

interface CommentItemProps {
  comment: Comment;
  articleId: number;
  onCommentUpdate: (updatedComment: Comment) => void;
  onCommentDelete: (commentId: number) => void;
  onCommentAdd: (newComment: Comment) => void;
}

const CommentItem: React.FC<CommentItemProps> = ({ 
  comment, 
  articleId,
  onCommentUpdate, 
  onCommentDelete,
  onCommentAdd 
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(comment.text);
  const [isReplying, setIsReplying] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [loading, setLoading] = useState(false);
  
  const currentUser = authService.getCurrentUser();
  const isAuthor = currentUser && currentUser.email === comment.authorId;
  const isAuthenticated = authService.isAuthenticated();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const handleEdit = async () => {
    if (!isAuthor) return;
    
    setLoading(true);
    try {
      const updateDto: UpdateCommentDto = {
        text: editText
      };
      
      const updatedComment = await updateComment(comment.id, updateDto);
      onCommentUpdate(updatedComment);
      setIsEditing(false);
    } catch (error) {
      console.error('Ошибка при обновлении комментария:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!isAuthor) return;
    
    if (window.confirm('Вы уверены, что хотите удалить этот комментарий?')) {
      setLoading(true);
      try {
        await deleteComment(comment.id);
        onCommentDelete(comment.id);
      } catch (error) {
        console.error('Ошибка при удалении комментария:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleReply = async () => {
    if (!isAuthenticated || !replyText.trim()) return;
    
    setLoading(true);
    try {
      const replyDto: CreateCommentDto = {
        text: replyText,
        authorId: currentUser!.email,
        articleId: articleId,
        parentCommentId: comment.id
      };
      
      const newComment = await createComment(replyDto);
      onCommentAdd(newComment);
      setIsReplying(false);
      setReplyText('');
    } catch (error) {
      console.error('Ошибка при создании ответа на комментарий:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeChange = (liked: boolean, count: number) => {
    // Обновляем локальное состояние лайков
    const updatedComment = {
      ...comment,
      likesCount: count,
      isLikedByCurrentUser: liked
    };
    onCommentUpdate(updatedComment);
  };

  return (
    <Card className="mb-3" id={`comment-${comment.id}`}>
      <Card.Body>
        <div className="d-flex justify-content-between mb-2">
          <div>
            <strong>{comment.authorName}</strong>
            {comment.parentCommentId && (
              <Badge bg="secondary" className="ms-2">Ответ</Badge>
            )}
            <small className="text-muted ms-2">
              {formatDate(comment.createdAt)}
              {comment.updatedAt && ' (ред.)'}
            </small>
          </div>
          <div>
            <LikeButton 
              type="comment"
              id={comment.id}
              initialLikesCount={comment.likesCount}
              initialLiked={comment.isLikedByCurrentUser}
              onLikeChange={handleLikeChange}
            />
          </div>
        </div>
        
        {isEditing ? (
          <Form>
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={3}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleEdit}
                disabled={loading}
              >
                Сохранить
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setIsEditing(false);
                  setEditText(comment.text);
                }}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </Form>
        ) : (
          <>
            <p className="mb-2">{comment.text}</p>
            
            <div className="d-flex gap-2">
              {isAuthenticated && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  onClick={() => setIsReplying(!isReplying)}
                >
                  Ответить
                </Button>
              )}
              
              {isAuthor && (
                <>
                  <Button 
                    variant="outline-secondary" 
                    size="sm"
                    onClick={() => setIsEditing(true)}
                  >
                    Редактировать
                  </Button>
                  <Button 
                    variant="outline-danger" 
                    size="sm"
                    onClick={handleDelete}
                  >
                    Удалить
                  </Button>
                </>
              )}
            </div>
          </>
        )}
        
        {isReplying && (
          <Form className="mt-3">
            <Form.Group className="mb-3">
              <Form.Control
                as="textarea"
                rows={2}
                placeholder="Напишите ваш ответ..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
              />
            </Form.Group>
            <div className="d-flex gap-2">
              <Button 
                variant="primary" 
                size="sm" 
                onClick={handleReply}
                disabled={loading || !replyText.trim()}
              >
                Отправить
              </Button>
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => {
                  setIsReplying(false);
                  setReplyText('');
                }}
                disabled={loading}
              >
                Отмена
              </Button>
            </div>
          </Form>
        )}
        
        {/* Рекурсивное отображение ответов на комментарий */}
        {comment.replies && comment.replies.length > 0 && (
          <div className="ms-4 mt-3 border-start ps-3">
            {comment.replies.map(reply => (
              <CommentItem
                key={reply.id}
                comment={reply}
                articleId={articleId}
                onCommentUpdate={onCommentUpdate}
                onCommentDelete={onCommentDelete}
                onCommentAdd={onCommentAdd}
              />
            ))}
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default CommentItem; 