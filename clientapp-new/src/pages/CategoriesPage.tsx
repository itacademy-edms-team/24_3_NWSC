import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, ListGroup, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Category } from '../types/models';
import { categoryService } from '../services/categoryService';
import { getArticlesByCategory } from '../services/articleService';
import ArticleCard from '../components/ArticleCard';

const CategoriesPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка категорий
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const categoriesData = await categoryService.getCategories();
        setCategories(categoriesData);
        
        // Если в URL есть id, выбираем соответствующую категорию
        if (id) {
          const categoryId = parseInt(id, 10);
          const category = categoriesData.find(c => c.id === categoryId);
          if (category) {
            setSelectedCategory(category);
          } else {
            setError(`Категория с ID ${id} не найдена`);
          }
        } else if (categoriesData.length > 0) {
          // Если категорий нет в URL, выбираем первую
          navigate(`/categories/${categoriesData[0].id}`, { replace: true });
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки категорий:', error);
        setError('Не удалось загрузить список категорий');
        setLoading(false);
      }
    };

    fetchCategories();
  }, [id, navigate]);

  // Загрузка статей выбранной категории
  useEffect(() => {
    if (selectedCategory) {
      const fetchArticlesByCategory = async () => {
        try {
          setLoading(true);
          const articleData = await getArticlesByCategory(selectedCategory.id);
          setArticles(articleData.articles || []);
          setLoading(false);
        } catch (error) {
          console.error('Ошибка загрузки статей категории:', error);
          setError('Не удалось загрузить статьи данной категории');
          setLoading(false);
        }
      };

      fetchArticlesByCategory();
    }
  }, [selectedCategory]);

  const handleCategoryClick = (category: Category) => {
    navigate(`/categories/${category.id}`);
    setSelectedCategory(category);
  };

  if (loading && categories.length === 0) {
    return (
      <Container className="py-4 text-center">
        <Spinner animation="border" role="status">
          <span className="visually-hidden">Загрузка...</span>
        </Spinner>
      </Container>
    );
  }

  return (
    <Container className="py-4">
      <h1 className="mb-4">Категории</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Row>
        <Col md={3}>
          <Card className="mb-4">
            <Card.Header>Все категории</Card.Header>
            <ListGroup variant="flush">
              {categories.map(category => (
                <ListGroup.Item 
                  key={category.id} 
                  action 
                  active={selectedCategory?.id === category.id}
                  onClick={() => handleCategoryClick(category)}
                >
                  {category.name}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        
        <Col md={9}>
          {selectedCategory ? (
            <>
              <Card className="mb-4">
                <Card.Body>
                  <h2>{selectedCategory.name}</h2>
                  <p>{selectedCategory.description}</p>
                </Card.Body>
              </Card>
              
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" role="status">
                    <span className="visually-hidden">Загрузка статей...</span>
                  </Spinner>
                </div>
              ) : articles.length > 0 ? (
                <Row xs={1} md={2} className="g-4">
                  {articles.map(article => (
                    <Col key={article.id}>
                      <ArticleCard article={article} />
                    </Col>
                  ))}
                </Row>
              ) : (
                <Alert variant="info">
                  В данной категории пока нет статей
                </Alert>
              )}
            </>
          ) : (
            <Alert variant="info">
              Выберите категорию из списка слева
            </Alert>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default CategoriesPage; 