import React from 'react';
import { Container } from 'react-bootstrap';

const Footer: React.FC = () => {
  return (
    <footer className="bg-dark text-light py-4 mt-5">
      <Container>
        <div className="d-flex flex-wrap justify-content-between align-items-center">
          <div className="col-md-4 mb-3 mb-md-0">
            <h5>Новостной портал</h5>
            <p className="text-muted">© {new Date().getFullYear()} Все права защищены</p>
          </div>
          <div className="col-md-4 d-flex justify-content-end">
            <ul className="list-unstyled d-flex">
              <li className="ms-3">
                <a className="text-light" href="#">
                  <i className="bi bi-twitter"></i>
                </a>
              </li>
              <li className="ms-3">
                <a className="text-light" href="#">
                  <i className="bi bi-facebook"></i>
                </a>
              </li>
              <li className="ms-3">
                <a className="text-light" href="#">
                  <i className="bi bi-instagram"></i>
                </a>
              </li>
            </ul>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer; 