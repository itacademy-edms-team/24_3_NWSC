import React from 'react';
import { Modal } from 'react-bootstrap';

interface ImageModalProps {
  show: boolean;
  onHide: () => void;
  imageSrc: string;
  imageAlt: string;
}

const ImageModal: React.FC<ImageModalProps> = ({ show, onHide, imageSrc, imageAlt }) => {
  return (
    <Modal show={show} onHide={onHide} size="xl" centered>
      <Modal.Header closeButton>
        <Modal.Title>Просмотр изображения</Modal.Title>
      </Modal.Header>
      <Modal.Body className="text-center p-0">
        <img
          src={imageSrc}
          alt={imageAlt}
          className="img-fluid"
          style={{ 
            maxWidth: '100%', 
            maxHeight: '80vh',
            objectFit: 'contain'
          }}
        />
      </Modal.Body>
    </Modal>
  );
};

export default ImageModal; 