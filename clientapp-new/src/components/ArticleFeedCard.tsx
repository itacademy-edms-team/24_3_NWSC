import React, { useState } from 'react';
import { Card, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Article } from '../types/models';
import { getImageUrl } from '../utils/imageUtils';
import ImageGalleryModal from './ImageGalleryModal';

interface ArticleFeedCardProps {
  article: Article;
}

const ArticleFeedCard: React.FC<ArticleFeedCardProps> = ({ article }) => {
  const [showImageModal, setShowImageModal] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleImageClick = (index: number) => {
    setSelectedImageIndex(index);
    setShowImageModal(true);
  };

  const renderImages = () => {
    const images = article.imagePaths || [];
    if (images.length === 0) return null;

    return (
      <div className="article-images mb-3">
        {images.length === 1 ? (
          <img
            src={getImageUrl(images[0]) || ''}
            alt="Article image"
            className="img-fluid rounded cursor-pointer"
            style={{ width: '100%', maxHeight: '400px', objectFit: 'cover' }}
            onClick={() => handleImageClick(0)}
          />
        ) : (
          <div className="row g-2">
            {images.slice(0, 4).map((imagePath, index) => (
              <div key={index} className={`col-${images.length === 2 ? '6' : images.length === 3 && index === 0 ? '12' : '6'}`}>
                <div className="position-relative">
                  <img
                    src={getImageUrl(imagePath) || ''}
                    alt={`Article image ${index + 1}`}
                    className="img-fluid rounded cursor-pointer"
                    style={{ 
                      width: '100%', 
                      height: images.length === 3 && index === 0 ? '300px' : '200px', 
                      objectFit: 'cover' 
                    }}
                    onClick={() => handleImageClick(index)}
                  />
                  {index === 3 && images.length > 4 && (
                    <div 
                      className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white rounded cursor-pointer"
                      onClick={() => handleImageClick(index)}
                    >
                      <h4>+{images.length - 4}</h4>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const getContentPreview = (content: string, maxLength: number = 500) => {
    // Убираем HTML теги для предварительного просмотра
    const textContent = content.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ');
    if (textContent.length <= maxLength) return textContent;
    return textContent.substring(0, maxLength) + '...';
  };

  // Функция для правильного склонения русских слов
  const pluralize = (count: number, words: [string, string, string]) => {
    const cases = [2, 0, 1, 1, 1, 2];
    return words[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
  };

  const getLikesText = (count: number) => {
    return `${count} ${pluralize(count, ['лайк', 'лайка', 'лайков'])}`;
  };

  const getCommentsText = (count: number) => {
    return `${count} ${pluralize(count, ['комментарий', 'комментария', 'комментариев'])}`;
  };

  return (
    <>
      <Card className="mb-4 shadow-sm">
        <Card.Body>
          {/* Заголовок и мета-информация */}
          <div className="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h4 className="card-title mb-2">
                <Link to={`/articles/${article.id}`} className="text-decoration-none">
                  {article.title}
                </Link>
              </h4>
              <div className="text-muted small">
                <span>Автор: {article.authorName}</span> • 
                <span> {formatDate(article.createdAt)}</span> • 
                <span> Просмотров: {article.viewCount}</span>
              </div>
            </div>
          </div>

          {/* Изображения */}
          {renderImages()}

          {/* Предварительный просмотр контента */}
          <div className="article-content mb-3">
            <p className="text-muted mb-0" style={{ lineHeight: '1.6' }}>
              {getContentPreview(article.content)}
            </p>
          </div>

          {/* Категории и теги */}
          <div className="d-flex flex-wrap gap-1 mb-3">
            {article.categories.map(category => (
              <Badge key={category.id} bg="primary" className="me-1">
                {category.name}
              </Badge>
            ))}
            {article.tags.map(tag => (
              <Badge key={tag.id} bg="secondary" className="me-1">
                {tag.name}
              </Badge>
            ))}
          </div>

          {/* Действия */}
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex gap-3">
              <span className="text-muted small">
                <i className="bi bi-heart"></i> {getLikesText(article.likeCount || 0)}
              </span>
              <span className="text-muted small">
                <i className="bi bi-chat"></i> {getCommentsText(article.commentsCount || 0)}
              </span>
            </div>
            <Link to={`/articles/${article.id}`} className="btn btn-outline-primary btn-sm">
              Читать полностью
            </Link>
          </div>
        </Card.Body>
      </Card>

      {/* Модальное окно для просмотра изображений */}
      {article.imagePaths && article.imagePaths.length > 0 && (
        <ImageGalleryModal
          show={showImageModal}
          onHide={() => setShowImageModal(false)}
          images={article.imagePaths}
          initialIndex={selectedImageIndex}
          title={article.title}
        />
      )}
    </>
  );
};

export default ArticleFeedCard; 