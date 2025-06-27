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
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
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
        
        // Устанавливаем текущие изображения
        setExistingImages((articleData.imagePaths || []).filter((img: string | null): img is string => !!img));
        
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
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];
    const maxImages = 5;
    const totalImages = existingImages.length + selectedImages.length;
    const remainingSlots = maxImages - totalImages;
    const filesToProcess = files.slice(0, remainingSlots);
    if (files.length > remainingSlots) {
      setError(`Можно загрузить максимум ${maxImages} изображений. Осталось слотов: ${remainingSlots}`);
    }
    filesToProcess.forEach((file) => {
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) return setError(`Файл "${file.name}" превышает размер 5MB`);
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) return setError(`Файл "${file.name}" имеет неподдерживаемый формат.`);
      validFiles.push(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        newPreviews.push(event.target?.result as string);
        if (newPreviews.length === validFiles.length) {
          setSelectedImages(prev => [...prev, ...validFiles]);
          setImagePreviews(prev => [...prev, ...newPreviews]);
          setError(null);
        }
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  const removeExistingImage = (index: number) => {
    setExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  const removeNewImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const removeAllImages = () => {
    setExistingImages([]);
    setSelectedImages([]);
    setImagePreviews([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !article) return;
    setError(null);
    setLoading(true);
    try {
      const updateData: UpdateArticleDto = {
        ...formData,
        images: selectedImages,
        // Передаем список оставшихся существующих изображений (пути), чтобы сервер мог их сохранить
        imagePaths: existingImages
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
            
            <Form.Group className="mb-3" controlId="images">
              <Form.Label>Изображения статьи</Form.Label>
              <Form.Control
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                multiple
              />
              <Form.Text className="text-muted">
                Выберите изображения для статьи (максимум 5)
              </Form.Text>
              <div className="mt-2">
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="text-muted">Текущие изображения:</span>
                  <Button variant="outline-danger" size="sm" onClick={removeAllImages}>Удалить все</Button>
                </div>
                <div className="d-flex flex-wrap">
                  {existingImages.map((img, idx) => (
                    <div key={img} className="m-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Изображение {idx + 1}:</span>
                        <Button variant="outline-danger" size="sm" onClick={() => removeExistingImage(idx)}>Удалить</Button>
                      </div>
                      <img src={getImageUrl(img) || ''} alt={`Изображение ${idx + 1}`} style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }} className="img-thumbnail" />
                    </div>
                  ))}
                  {imagePreviews.map((preview, idx) => (
                    <div key={preview} className="m-2">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Новое изображение {idx + 1}:</span>
                        <Button variant="outline-danger" size="sm" onClick={() => removeNewImage(idx)}>Удалить</Button>
                      </div>
                      <img src={preview} alt={`Новое изображение ${idx + 1}`} style={{ maxWidth: '200px', maxHeight: '120px', objectFit: 'cover' }} className="img-thumbnail" />
                    </div>
                  ))}
                </div>
              </div>
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