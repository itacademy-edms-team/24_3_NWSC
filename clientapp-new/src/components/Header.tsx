import React from 'react';
import { Navbar, Nav, Container, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { useTheme } from '../contexts/ThemeContext';

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const isAuthenticated = authService.isAuthenticated();
  const currentUser = authService.getCurrentUser();
  const isAdmin = authService.isAdmin();
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      navigate('/login');
    } catch (error) {
      console.error('Ошибка при выходе:', error);
    }
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
      <Container>
        <Navbar.Brand as={Link} to="/articles">Новостной портал</Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            {/* <Nav.Link as={Link} to="/">Главная</Nav.Link> */}
            <Nav.Link as={Link} to="/articles">Статьи</Nav.Link>
            <Nav.Link as={Link} to="/categories">Категории</Nav.Link>
            <Nav.Link as={Link} to="/tags">Теги</Nav.Link>
            {isAuthenticated && (
              <Nav.Link as={Link} to="/create-article">Создать статью</Nav.Link>
            )}
            {isAuthenticated && isAdmin && (
              <Nav.Link as={Link} to="/admin" className="text-warning">
                <i className="bi bi-gear"></i> Админ панель
              </Nav.Link>
            )}
          </Nav>
          <Nav>
            <Nav.Item className="d-flex align-items-center">
              <button
                className="theme-toggle me-3"
                onClick={toggleTheme}
                title={theme === 'light' ? 'Переключить на темную тему' : 'Переключить на светлую тему'}
              >
                <i className={`bi ${theme === 'light' ? 'bi-moon-stars' : 'bi-sun'} theme-icon`}></i>
              </button>
              <Nav.Link as={Link} to="/verify-email" className="me-3">
                <i className="bi bi-envelope-check"></i> Подтвердить почту
              </Nav.Link>
            </Nav.Item>
            
            {isAuthenticated ? (
              <>
                <Navbar.Text className="me-2">
                  Привет, {currentUser?.firstName || 'Пользователь'}!
                  {isAdmin && <span className="badge bg-warning text-dark ms-1">Admin</span>}
                </Navbar.Text>
                <Button variant="outline-light" onClick={handleLogout}>Выход</Button>
              </>
            ) : (
              <>
                <Nav.Link as={Link} to="/login">Вход</Nav.Link>
                <Nav.Link as={Link} to="/register">Регистрация</Nav.Link>
              </>
            )}
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default Header; 