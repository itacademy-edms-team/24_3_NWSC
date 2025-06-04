import React, { useState } from 'react';
import { Modal, Button, Carousel } from 'react-bootstrap';
import { getImageUrl } from '../utils/imageUtils';

interface ImageGalleryModalProps {
  show: boolean;
  onHide: () => void;
  images: string[];
  title: string;
  initialIndex?: number;
}

const ImageGalleryModal: React.FC<ImageGalleryModalProps> = ({ 
  show, 
  onHide, 
  images, 
  title, 
  initialIndex = 0 
}) => {
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const handleSelect = (selectedIndex: number) => {
    setActiveIndex(selectedIndex);
  };

  if (!images || images.length === 0) {
    return null;
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered className="image-gallery-modal">
      <Modal.Header closeButton>
        <Modal.Title>
          {title} - Изображение {activeIndex + 1} из {images.length}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        {images.length === 1 ? (
          // Одиночное изображение
          <div className="text-center">
            <img
              src={getImageUrl(images[0]) || ''}
              alt={title}
              className="img-fluid"
              style={{ 
                maxWidth: '100%', 
                maxHeight: '80vh',
                objectFit: 'contain'
              }}
            />
          </div>
        ) : (
          // Карусель для нескольких изображений
          <Carousel 
            activeIndex={activeIndex} 
            onSelect={handleSelect}
            interval={null}
            indicators={true}
            controls={true}
            className="image-gallery-carousel"
          >
            {images.map((imagePath, index) => (
              <Carousel.Item key={index}>
                <div className="text-center" style={{ height: '80vh' }}>
                  <img
                    src={getImageUrl(imagePath) || ''}
                    alt={`${title} - изображение ${index + 1}`}
                    className="img-fluid"
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                  />
                </div>
              </Carousel.Item>
            ))}
          </Carousel>
        )}
      </Modal.Body>
      <Modal.Footer className="justify-content-between">
        <div>
          {images.length > 1 && (
            <span className="text-muted">
              Изображение {activeIndex + 1} из {images.length}
            </span>
          )}
        </div>
        <Button variant="secondary" onClick={onHide}>
          Закрыть
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ImageGalleryModal; 