import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { createArticle } from '../services/articleService';
import { Category, Tag, CreateArticleDto } from '../types/models';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';

const CreateArticlePage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CreateArticleDto>({
    title: '',
    content: '',
    authorId: '',
    categoryIds: [],
    tagIds: []
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Проверка авторизации
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: '/create-article' } } });
    } else {
      // Установить ID автора
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        setFormData(prev => ({ ...prev, authorId: currentUser.email }));
      }
    }
  }, [navigate]);

  // Загрузка категорий и тегов
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          categoryService.getCategories(),
          tagService.getTags()
        ]);
        setCategories(categoriesData);
        setTags(tagsData);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить категории и теги. Пожалуйста, попробуйте позже.');
      } finally {
        setLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, categoryIds: selectedOptions }));
  };

  const handleTagChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => parseInt(option.value));
    setFormData(prev => ({ ...prev, tagIds: selectedOptions }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const article = await createArticle(formData);
      navigate(`/articles/${article.id}`);
    } catch (error: any) {
      console.error('Ошибка создания статьи:', error);
      setError(error.response?.data?.message || 'Ошибка при создании статьи. Пожалуйста, попробуйте позже.');
    } finally {
      setLoading(false);
    }
  };

  if (loadingData) {
    return (
      <Container className="py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <h1 className="mb-4">Создание новой статьи</h1>
          
          {error && <Alert variant="danger">{error}</Alert>}
          
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3" controlId="title">
              <Form.Label>Заголовок статьи</Form.Label>
              <Form.Control
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Введите заголовок статьи"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="content">
              <Form.Label>Содержание статьи</Form.Label>
              <Form.Control
                as="textarea"
                name="content"
                value={formData.content}
                onChange={handleChange}
                required
                rows={10}
                placeholder="Введите текст статьи"
              />
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="categories">
              <Form.Label>Категории</Form.Label>
              <Form.Select 
                multiple
                onChange={handleCategoryChange}
                value={formData.categoryIds.map(String)}
                style={{ height: '150px' }}
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Выберите одну или несколько категорий (для множественного выбора удерживайте Ctrl или Command)
              </Form.Text>
            </Form.Group>
            
            <Form.Group className="mb-3" controlId="tags">
              <Form.Label>Теги</Form.Label>
              <Form.Select 
                multiple
                onChange={handleTagChange}
                value={formData.tagIds.map(String)}
                style={{ height: '150px' }}
              >
                {tags.map(tag => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </Form.Select>
              <Form.Text className="text-muted">
                Выберите один или несколько тегов (для множественного выбора удерживайте Ctrl или Command)
              </Form.Text>
            </Form.Group>
            
            <div className="d-flex justify-content-between">
              <Button variant="secondary" onClick={() => navigate(-1)}>
                Отмена
              </Button>
              <Button variant="primary" type="submit" disabled={loading}>
                {loading ? 'Создание...' : 'Создать статью'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default CreateArticlePage; 