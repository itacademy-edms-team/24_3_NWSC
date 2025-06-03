import React from 'react';
import { Navigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Alert, Container } from 'react-bootstrap';

interface AdminRouteProps {
  children: React.ReactNode;
}

const AdminRoute: React.FC<AdminRouteProps> = ({ children }) => {
  const isAuthenticated = authService.isAuthenticated();
  const isAdmin = authService.isAdmin();

  if (!isAuthenticated) {
    // Если пользователь не авторизован, перенаправляем на страницу входа
    return <Navigate to="/login" state={{ from: { pathname: '/admin' } }} replace />;
  }

  if (!isAdmin) {
    // Если пользователь авторизован, но не администратор, показываем сообщение об ошибке
    return (
      <Container className="py-4">
        <Alert variant="danger">
          <Alert.Heading>Доступ запрещен</Alert.Heading>
          <p>У вас нет прав для доступа к административной панели. Для доступа необходимы права администратора.</p>
        </Alert>
      </Container>
    );
  }

  // Если все проверки пройдены, рендерим дочерние компоненты
  return <>{children}</>;
};

export default AdminRoute; 