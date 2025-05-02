import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Компоненты
import Header from './components/Header';
import Footer from './components/Footer';

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
  ApiDebugPage
} from './pages';

function App() {
  return (
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
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Container>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
