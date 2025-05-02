import React, { useState, useEffect } from 'react';
import { Button } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { authService } from '../services/authService';
import { likeArticle, unlikeArticle, hasUserLikedArticle, likeComment, unlikeComment, hasUserLikedComment } from '../services/likeService';

interface LikeButtonProps {
  type: 'article' | 'comment';
  id: number;
  initialLikesCount: number;
  initialLiked: boolean;
  onLikeChange?: (liked: boolean, count: number) => void;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  type, 
  id, 
  initialLikesCount, 
  initialLiked,
  onLikeChange 
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const isAuthenticated = authService.isAuthenticated();

  useEffect(() => {
    if (isAuthenticated) {
      const checkLikeStatus = async () => {
        try {
          let isLiked;
          
          if (type === 'article') {
            isLiked = await hasUserLikedArticle(id);
          } else {
            isLiked = await hasUserLikedComment(id);
          }
          
          setLiked(isLiked);
        } catch (error) {
          console.error('Ошибка при проверке статуса лайка:', error);
        }
      };
      
      checkLikeStatus();
    }
  }, [id, type, isAuthenticated]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      // Если пользователь не авторизован, перенаправляем на страницу входа
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    
    try {
      if (liked) {
        // Убираем лайк
        if (type === 'article') {
          await unlikeArticle(id);
        } else {
          await unlikeComment(id);
        }
        setLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      } else {
        // Ставим лайк
        if (type === 'article') {
          await likeArticle(id);
        } else {
          await likeComment(id);
        }
        setLiked(true);
        setLikesCount(prev => prev + 1);
      }
      
      // Уведомляем родительский компонент об изменении
      if (onLikeChange) {
        onLikeChange(!liked, liked ? likesCount - 1 : likesCount + 1);
      }
    } catch (error) {
      console.error('Ошибка при установке/снятии лайка:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button 
      variant="light" 
      className="d-flex align-items-center" 
      onClick={handleLikeClick}
      disabled={loading}
    >
      <FontAwesomeIcon 
        icon={liked ? solidHeart : regularHeart} 
        className={liked ? "text-danger me-1" : "me-1"} 
      />
      <span>{likesCount}</span>
    </Button>
  );
};

export default LikeButton; 