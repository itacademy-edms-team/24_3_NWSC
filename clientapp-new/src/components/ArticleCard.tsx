import React from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Article } from '../types/models';

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
  const summary = article.content.length > 150 
    ? `${article.content.substring(0, 150)}...` 
    : article.content;

  return (
    <Card className="h-100 shadow-sm">
      <Card.Body>
        <Card.Title>
          <Link to={`/articles/${article.id}`} className="text-decoration-none text-dark">
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
      <Card.Footer className="bg-white">
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