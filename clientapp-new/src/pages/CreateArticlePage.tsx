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
    tagIds: [],
    images: []
  });
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    
    // Ограничиваем количество изображений (максимум 5)
    const maxImages = 5;
    const remainingSlots = maxImages - selectedImages.length;
    const filesToProcess = files.slice(0, remainingSlots);
    
    if (files.length > remainingSlots) {
      setError(`Можно загрузить максимум ${maxImages} изображений. Выбрано изображений: ${files.length}, осталось слотов: ${remainingSlots}`);
    }
    
    let hasError = false;
    
    filesToProcess.forEach((file) => {
      // Проверяем размер файла (максимум 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB в байтах
      if (file.size > maxSize) {
        setError(`Файл "${file.name}" превышает размер 5MB`);
        hasError = true;
        return;
      }
      
      // Проверяем тип файла
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setError(`Файл "${file.name}" имеет неподдерживаемый формат. Поддерживаются: JPEG, PNG, GIF, WebP`);
        hasError = true;
        return;
      }
      
      validFiles.push(file);
      
      // Создаем предварительный просмотр
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        
        // Когда все изображения загружены, обновляем состояние
        if (newPreviews.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
          setError(null); // Сбрасываем ошибку если файлы корректные
        }
      };
      reader.readAsDataURL(file);
    });
    
    // Очищаем input для возможности повторного выбора тех же файлов
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setSelectedImages([]);
    setImagePreviews([]);
    // Очищаем input файла
    const fileInput = document.getElementById('images') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
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
      const articleData: CreateArticleDto = {
        ...formData,
        images: selectedImages
      };
      
      const article = await createArticle(articleData);
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
            
            <Form.Group className="mb-3" controlId="images">
              <Form.Label>Изображения статьи</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />
              <Form.Text className="text-muted">
                Выберите изображения для статьи (необязательно, максимум 5 изображений)
              </Form.Text>
              {imagePreviews.length > 0 && (
                <div className="mt-2">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="text-muted">Предварительные просмотры:</span>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={removeAllImages}
                    >
                      Удалить все изображения
                    </Button>
                  </div>
                  <div className="d-flex flex-wrap">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="m-2">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <span className="text-muted">Изображение {index + 1}:</span>
                          <Button
                            variant="outline-danger"
                            size="sm"
                            onClick={() => removeImage(index)}
                          >
                            Удалить
                          </Button>
                        </div>
                        <img
                          src={preview}
                          alt={`Предварительный просмотр изображения ${index + 1}`}
                          style={{ maxWidth: '300px', maxHeight: '200px', objectFit: 'cover' }}
                          className="img-thumbnail"
                        />
                      </div>
                    ))}
                  </div>
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