import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, updateArticle } from '../services/articleService';
import { Article, Category, Tag, UpdateArticleDto } from '../types/models';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';

const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<UpdateArticleDto>({
    title: '',
    content: '',
    categoryIds: [],
    tagIds: []
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  // Проверка авторизации и загрузка данных
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { state: { from: { pathname: `/edit-article/${id}` } } });
      return;
    }

    const fetchData = async () => {
      if (!id) return;

      try {
        setLoadingData(true);
        // Загружаем статью, категории и теги параллельно
        const [articleData, categoriesData, tagsData] = await Promise.all([
          getArticleById(parseInt(id, 10)),
          categoryService.getCategories(),
          tagService.getTags()
        ]);
        
        setArticle(articleData);
        setCategories(categoriesData);
        setTags(tagsData);
        
        // Проверяем, имеет ли пользователь право редактировать статью
        const currentUser = authService.getCurrentUser();
        if (currentUser && currentUser.email !== articleData.authorId) {
          const userRoles = JSON.parse(localStorage.getItem('user_roles') || '[]');
          if (!userRoles.includes('Admin')) {
            setError('У вас нет прав на редактирование этой статьи');
            setLoadingData(false);
            return;
          }
        }
        
        // Заполняем форму данными статьи
        setFormData({
          title: articleData.title,
          content: articleData.content,
          categoryIds: articleData.categories.map(c => c.id),
          tagIds: articleData.tags.map(t => t.id)
        });
        
        setLoadingData(false);
      } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        setError('Не удалось загрузить данные статьи. Пожалуйста, попробуйте позже.');
        setLoadingData(false);
      }
    };

    fetchData();
  }, [id, navigate]);

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
    
    if (!id || !article) return;
    
    setError(null);
    setLoading(true);

    try {
      await updateArticle(parseInt(id, 10), formData);
      navigate(`/articles/${id}`);
    } catch (error: any) {
      console.error('Ошибка обновления статьи:', error);
      setError(error.response?.data?.message || 'Ошибка при обновлении статьи. Пожалуйста, попробуйте позже.');
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

  if (error && !article) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
        <Button variant="primary" onClick={() => navigate(-1)}>
          Назад
        </Button>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <Card>
        <Card.Body>
          <h1 className="mb-4">Редактирование статьи</h1>
          
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
                {loading ? 'Сохранение...' : 'Сохранить изменения'}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default EditArticlePage; 