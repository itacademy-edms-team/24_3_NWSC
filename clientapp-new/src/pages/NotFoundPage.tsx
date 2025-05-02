import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const NotFoundPage: React.FC = () => {
  return (
    <Container className="py-5 text-center">
      <Row className="justify-content-center">
        <Col md={8}>
          <h1 className="display-1">404</h1>
          <h2 className="mb-4">Страница не найдена</h2>
          <p className="lead mb-5">
            Извините, но страница, которую вы ищете, не существует или была перемещена.
          </p>
          <div>
            <Link to="/" className="btn btn-primary me-3">
              На главную
            </Link>
            <Button variant="outline-secondary" onClick={() => window.history.back()}>
              Вернуться назад
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFoundPage; 