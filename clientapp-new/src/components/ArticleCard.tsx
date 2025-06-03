import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Article } from '../types/models';
import { getImageUrl } from '../utils/imageUtils';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  // Форматируем дату создания
  const formattedDate = new Date(article.createdAt).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  // Получаем краткое содержание статьи (первые 150 символов)
  // Убираем HTML теги для отображения в превью
  const cleanContent = article.content.replace(/<[^>]*>/g, '');
  const summary = cleanContent.length > 150 
    ? `${cleanContent.substring(0, 150)}...` 
    : cleanContent;

  return (
    <Card className="h-100 shadow-sm">
      {/* Отображаем первое изображение из массива или единичное изображение */}
      {((article.imagePaths && article.imagePaths.length > 0) || article.imagePath) && (
        <div style={{ height: '200px', overflow: 'hidden', position: 'relative' }}>
          <Card.Img 
            variant="top" 
            src={getImageUrl(
              (article.imagePaths && article.imagePaths.length > 0) 
                ? article.imagePaths[0] 
                : article.imagePath
            ) || ''}
            alt={article.title}
            className="article-card-image"
            style={{ 
              width: '100%', 
              height: '100%', 
              objectFit: 'cover',
              transition: 'transform 0.3s ease'
            }}
            onError={(e) => {
              console.error('Ошибка загрузки изображения в карточке:', 
                (article.imagePaths && article.imagePaths.length > 0) 
                  ? article.imagePaths[0] 
                  : article.imagePath
              );
              e.currentTarget.parentElement!.style.display = 'none';
            }}
          />
          {/* Показываем количество изображений, если их больше одного */}
          {article.imagePaths && article.imagePaths.length > 1 && (
            <div 
              className="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 rounded-start"
              style={{ fontSize: '0.8rem' }}
            >
              +{article.imagePaths.length - 1} ещё
            </div>
          )}
        </div>
      )}
      <Card.Body>
        <Card.Title>
          <Link to={`/articles/${article.id}`} className="text-decoration-none">
            {article.title}
          </Link>
        </Card.Title>
        <Card.Subtitle className="mb-2 text-muted">
          <small>{article.authorName} • {formattedDate}</small>
        </Card.Subtitle>
        <div className="mb-2">
          {article.categories.map(category => (
            <Link to={`/categories/${category.id}`} key={category.id}>
              <Badge bg="primary" className="me-1">{category.name}</Badge>
            </Link>
          ))}
          {article.tags.map(tag => (
            <Link to={`/tags/${tag.id}`} key={tag.id}>
              <Badge bg="secondary" className="me-1">{tag.name}</Badge>
            </Link>
          ))}
        </div>
        <Card.Text>
          {summary}
        </Card.Text>
      </Card.Body>
      <Card.Footer>
        <div className="d-flex justify-content-between">
          <small className="text-muted">Просмотры: {article.viewCount}</small>
          <Link to={`/articles/${article.id}`} className="btn btn-sm btn-outline-primary">
            Читать далее
          </Link>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default ArticleCard; 