import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './App.css';

// Контексты
import { ThemeProvider } from './contexts/ThemeContext';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';
import AdminRoute from './components/AdminRoute';

// Страницы
import {
  HomePage,
  ArticlesPage,
  ArticleDetailPage,
  LoginPage,
  RegisterPage,
  CreateArticlePage,
  EditArticlePage,
  ProfilePage,
  NotFoundPage,
  AuthDebugPage,
  CategoriesPage,
  TagsPage,
  ApiDebugPage,
  VerifyEmailPage,
  VerifyEmailSuccessPage
} from './pages';

// Админ страницы
import AdminDashboard from './pages/admin/AdminDashboard';
import UserManagement from './pages/admin/UserManagement';
import ArticleModeration from './pages/admin/ArticleModeration';
import CommentModeration from './pages/admin/CommentModeration';

function App() {
  return (
    <ThemeProvider>
      <Router>
        <div className="App d-flex flex-column min-vh-100">
          <Header />
          <Container className="flex-grow-1 py-3">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/articles" element={<ArticlesPage />} />
              <Route path="/articles/:id" element={<ArticleDetailPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/create-article" element={<CreateArticlePage />} />
              <Route path="/edit-article/:id" element={<EditArticlePage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/auth-debug" element={<AuthDebugPage />} />
              <Route path="/api-debug" element={<ApiDebugPage />} />
              <Route path="/categories" element={<CategoriesPage />} />
              <Route path="/categories/:id" element={<CategoriesPage />} />
              <Route path="/tags" element={<TagsPage />} />
              <Route path="/tags/:id" element={<TagsPage />} />
              <Route path="/verify-email" element={<VerifyEmailPage />} />
              <Route path="/verify-email/success" element={<VerifyEmailSuccessPage />} />
              
              {/* Защищенные админ маршруты */}
              <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
              <Route path="/admin/users" element={<AdminRoute><UserManagement /></AdminRoute>} />
              <Route path="/admin/articles" element={<AdminRoute><ArticleModeration /></AdminRoute>} />
              <Route path="/admin/comments" element={<AdminRoute><CommentModeration /></AdminRoute>} />
              
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Container>
          <Footer />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
