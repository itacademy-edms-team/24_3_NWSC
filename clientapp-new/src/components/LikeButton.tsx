import React, { useState, useEffect } from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeart as solidHeart } from '@fortawesome/free-solid-svg-icons';
import { faHeart as regularHeart } from '@fortawesome/free-regular-svg-icons';
import { authService } from '../services/authService';
import ApiDebugButton from './ApiDebugButton';
import { 
  likeArticle, 
  unlikeArticle, 
  hasUserLikedArticle, 
  likeComment, 
  unlikeComment, 
  hasUserLikedComment,
  getArticleLikesCount,
  getCommentLikesCount
} from '../services/likeService';

interface LikeButtonProps {
  type: 'article' | 'comment';
  id: number;
  initialLikesCount: number;
  initialLiked: boolean;
  onLikeChange?: (liked: boolean, count: number) => void;
  showDebug?: boolean;
}

const LikeButton: React.FC<LikeButtonProps> = ({ 
  type, 
  id, 
  initialLikesCount, 
  initialLiked,
  onLikeChange,
  showDebug = false
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isAuthenticated = authService.isAuthenticated();

  // Функция для обновления количества лайков из API
  const refreshLikesCount = async () => {
    try {
      console.log(`Обновление количества лайков для ${type} с ID ${id}`);
      let count;
      
      if (type === 'article') {
        count = await getArticleLikesCount(id);
      } else {
        count = await getCommentLikesCount(id);
      }
      
      console.log(`Обновленное количество лайков для ${type} ${id}: ${count}`);
      setLikesCount(count);
      return count;
    } catch (error: any) {
      console.error(`Ошибка при обновлении количества лайков для ${type} ${id}:`, error);
      return likesCount; // Возвращаем текущее значение в случае ошибки
    }
  };

  // Загружаем начальное состояние лайка и количество лайков при монтировании
  useEffect(() => {
    const initLikes = async () => {
      if (!id) return;
      
      // Обновляем количество лайков независимо от авторизации
      await refreshLikesCount();
      
      // Проверяем, лайкнул ли пользователь, только если он авторизован
      if (isAuthenticated) {
        try {
          console.log(`Проверка статуса лайка для ${type} с ID ${id}`);
          let isLiked;
          
          if (type === 'article') {
            isLiked = await hasUserLikedArticle(id);
          } else {
            isLiked = await hasUserLikedComment(id);
          }
          
          console.log(`Результат проверки лайка: ${isLiked}`);
          setLiked(isLiked);
        } catch (error: any) {
          console.error(`Ошибка при проверке статуса лайка для ${type} ${id}:`, error);
          setError(`Не удалось проверить статус лайка: ${error.message}`);
          // В случае ошибки используем initialLiked как запасной вариант
          setLiked(initialLiked);
        }
      } else {
        console.log('Пользователь не авторизован, статус лайка не проверяется');
        setLiked(false);
      }
    };
    
    initLikes();
  }, [id, type, isAuthenticated, initialLiked]);

  const handleLikeClick = async () => {
    if (!isAuthenticated) {
      console.log('Пользователь не авторизован, перенаправление на страницу входа');
      window.location.href = '/login';
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log(`${liked ? 'Убираем' : 'Ставим'} лайк для ${type} с ID ${id}`);
      
      if (liked) {
        // Убираем лайк
        if (type === 'article') {
          await unlikeArticle(id);
        } else {
          await unlikeComment(id);
        }
        setLiked(false);
      } else {
        // Ставим лайк
        if (type === 'article') {
          await likeArticle(id);
        } else {
          await likeComment(id);
        }
        setLiked(true);
      }
      
      // Обновляем количество лайков после действия
      const newCount = await refreshLikesCount();
      
      // Уведомляем родительский компонент об изменении
      if (onLikeChange) {
        onLikeChange(!liked, newCount);
      }
    } catch (error: any) {
      console.error(`Ошибка при установке/снятии лайка для ${type} ${id}:`, error);
      setError(`Не удалось обновить лайк: ${error.message}`);
      
      if (error.response) {
        console.error('Ответ сервера:', error.response.data);
        console.error('Статус ответа:', error.response.status);
      }
      
      // Обновляем количество лайков на всякий случай, даже если была ошибка
      refreshLikesCount();
    } finally {
      setLoading(false);
    }
  };

  const renderTooltip = (props: any) => (
    <Tooltip id="like-button-tooltip" {...props}>
      {error ? `Ошибка: ${error}` : liked ? 'Убрать лайк' : 'Поставить лайк'}
    </Tooltip>
  );

  const apiEndpoint = type === 'article' 
    ? `/Likes/Article/${id}/Count` 
    : `/Likes/Comment/${id}/Count`;

  return (
    <div className="d-flex align-items-center">
      <OverlayTrigger
        placement="top"
        delay={{ show: 500, hide: 100 }}
        overlay={renderTooltip}
      >
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
      </OverlayTrigger>
      
      {showDebug && (
        <ApiDebugButton 
          endpoint={apiEndpoint}
          method="GET"
          title="Отладка"
          includeAuth={false}
        />
      )}
    </div>
  );
};

export default LikeButton;