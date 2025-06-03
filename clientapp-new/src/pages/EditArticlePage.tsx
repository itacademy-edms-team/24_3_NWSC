import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Alert, Container } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { getArticleById, updateArticle } from '../services/articleService';
import { Article, Category, Tag, UpdateArticleDto } from '../types/models';
import { authService } from '../services/authService';
import { categoryService } from '../services/categoryService';
import { tagService } from '../services/tagService';
import { getImageUrl } from '../utils/imageUtils';

const EditArticlePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [article, setArticle] = useState<Article | null>(null);
  const [formData, setFormData] = useState<UpdateArticleDto>({
    title: '',
    content: '',
    categoryIds: [],
    tagIds: [],
    images: []
  });
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [currentImagePath, setCurrentImagePath] = useState<string | null>(null);
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
          content: articleData.content.replace(/<br>/g, '\n'), // Конвертируем HTML переносы обратно в текстовые
          categoryIds: articleData.categories.map(c => c.id),
          tagIds: articleData.tags.map(t => t.id),
          images: []
        });
        
        // Устанавливаем текущее изображение
        if (articleData.imagePath) {
          setCurrentImagePath(articleData.imagePath);
        }
        
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Проверяем размер файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB в байтах
      if (file.size > maxSize) {
        setError('Размер файла не должен превышать 5MB');
        e.target.value = ''; // Очищаем input
        return;
      }
      
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError('Поддерживаются только изображения в форматах: JPEG, PNG, GIF, WebP');
        e.target.value = ''; // Очищаем input
        return;
      }
      
      setSelectedImage(file);
      setError(null); // Сбрасываем ошибку если файл корректный
      
      // Создаем предварительный просмотр
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setSelectedImage(null);
      setImagePreview(null);
    }
  };

  const removeCurrentImage = () => {
    setCurrentImagePath(null);
    setSelectedImage(null);
    setImagePreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id || !article) return;
    
    setError(null);
    setLoading(true);

    try {
      const updateData: UpdateArticleDto = {
        ...formData,
        images: selectedImage ? [selectedImage] : []
      };
      
      await updateArticle(parseInt(id, 10), updateData);
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
            
            <Form.Group className="mb-3" controlId="image">
              <Form.Label>Изображение статьи</Form.Label>
              
              {currentImagePath && !imagePreview && (
                <div className="mb-2">
                  <p className="text-muted">Текущее изображение:</p>
                  <div className="position-relative d-inline-block">
                    <img
                      src={getImageUrl(currentImagePath) || ''}
                      alt="Текущее изображение"
                      style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                      className="img-thumbnail"
                      onError={(e) => {
                        console.error('Ошибка загрузки текущего изображения:', currentImagePath);
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0"
                      onClick={removeCurrentImage}
                      style={{ transform: 'translate(50%, -50%)' }}
                    >
                      ×
                    </Button>
                  </div>
                </div>
              )}
              
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
              />
              <Form.Text className="text-muted">
                Выберите новое изображение для замены текущего (необязательно)
              </Form.Text>
              
              {imagePreview && (
                <div className="mt-2">
                  <p className="text-muted">Новое изображение:</p>
                  <img
                    src={imagePreview}
                    alt="Предварительный просмотр"
                    style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                    className="img-thumbnail"
                  />
                </div>
              )}
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
                placeholder="Введите текст статьи&#10;&#10;Переносы строк будут сохранены в итоговой статье"
              />
              <Form.Text className="text-muted">
                Переносы строк будут отображаться в статье как есть
              </Form.Text>
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