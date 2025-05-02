import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Badge, Alert, Spinner } from 'react-bootstrap';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Tag } from '../types/models';
import { tagService } from '../services/tagService';
import { getArticlesByTag } from '../services/articleService';
import ArticleCard from '../components/ArticleCard';

const TagsPage: React.FC = () => {
  const { id } = useParams<{ id?: string }>();
  const navigate = useNavigate();
  const [tags, setTags] = useState<Tag[]>([]);
  const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка списка тегов
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const tagsData = await tagService.getTags();
        setTags(tagsData);
        
        // Если в URL есть id, выбираем соответствующий тег
        if (id) {
          const tagId = parseInt(id, 10);
          const tag = tagsData.find(t => t.id === tagId);
          if (tag) {
            setSelectedTag(tag);
          } else {
            setError(`Тег с ID ${id} не найден`);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Ошибка загрузки тегов:', error);
        setError('Не удалось загрузить список тегов');
        setLoading(false);
      }
    };

    fetchTags();
  }, [id]);

  // Загрузка статей выбранного тега
  useEffect(() => {
    if (selectedTag) {
      const fetchArticlesByTag = async () => {
        try {
          setLoading(true);
          const articleData = await getArticlesByTag(selectedTag.id);
          setArticles(articleData.articles || []);
          setLoading(false);
        } catch (error) {
          console.error('Ошибка загрузки статей по тегу:', error);
          setError('Не удалось загрузить статьи с данным тегом');
          setLoading(false);
        }
      };

      fetchArticlesByTag();
    }
  }, [selectedTag]);

  const handleTagClick = (tag: Tag) => {
    navigate(`/tags/${tag.id}`);
    setSelectedTag(tag);
  };

  if (loading && tags.length === 0) {
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
      <h1 className="mb-4">Теги</h1>
      
      {error && <Alert variant="danger">{error}</Alert>}
      
      <Card className="mb-4">
        <Card.Body>
          <div className="d-flex flex-wrap gap-2">
            {tags.map(tag => (
              <Badge 
                key={tag.id} 
                bg={selectedTag?.id === tag.id ? "primary" : "secondary"}
                style={{ cursor: 'pointer', fontSize: '1rem', padding: '0.5rem' }}
                onClick={() => handleTagClick(tag)}
              >
                {tag.name}
              </Badge>
            ))}
          </div>
        </Card.Body>
      </Card>
      
      {selectedTag ? (
        <>
          <h2 className="mb-3">Статьи с тегом: {selectedTag.name}</h2>
          
          {loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" role="status">
                <span className="visually-hidden">Загрузка статей...</span>
              </Spinner>
            </div>
          ) : articles.length > 0 ? (
            <Row xs={1} md={2} lg={3} className="g-4">
              {articles.map(article => (
                <Col key={article.id}>
                  <ArticleCard article={article} />
                </Col>
              ))}
            </Row>
          ) : (
            <Alert variant="info">
              Статей с таким тегом пока нет
            </Alert>
          )}
        </>
      ) : (
        <Alert variant="info">
          Выберите тег из списка выше для просмотра статей
        </Alert>
      )}
    </Container>
  );
};

export default TagsPage; 