import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Button, Carousel, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { Article } from '../types/models';
import { articleService } from '../services/articleService';
import ArticleCard from '../components/ArticleCard';

const HomePage: React.FC = () => {
  const [featuredArticles, setFeaturedArticles] = useState<Article[]>([]);
  const [popularArticles, setPopularArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        // Получаем обычные статьи для карусели
        const articlesResponse = await articleService.getArticles(1, 5);
        setFeaturedArticles(articlesResponse.articles);

        // Получаем популярные статьи
        const popularResponse = await articleService.getPopularArticles(1, 3);
        setPopularArticles(popularResponse.articles);
      } catch (err) {
        console.error('Ошибка загрузки статей:', err);
        setError('Не удалось загрузить статьи. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, []);

  return (
    <Container>
      <section className="mb-5">
        <h1 className="text-center mb-4">Добро пожаловать на Новостной портал</h1>
        <p className="lead text-center">
          Самые актуальные новости и статьи на различные темы
        </p>
      </section>

      {loading ? (
        <div className="text-center my-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Загрузка...</span>
          </div>
        </div>
      ) : error ? (
        <div className="alert alert-danger" role="alert">
          {error}
        </div>
      ) : (
        <>
          {/* Карусель с избранными статьями */}
          <section className="mb-5">
            <h2 className="mb-4">Избранные статьи</h2>
            {featuredArticles.length > 0 ? (
              <Carousel>
                {featuredArticles.map(article => (
                  <Carousel.Item key={article.id}>
                    <div className="bg-light text-dark p-5">
                      <h3>{article.title}</h3>
                      <p>
                        {article.content.length > 200
                          ? `${article.content.substring(0, 200)}...`
                          : article.content}
                      </p>
                      <Link to={`/articles/${article.id}`} className="btn btn-primary">
                        Читать далее
                      </Link>
                    </div>
                  </Carousel.Item>
                ))}
              </Carousel>
            ) : (
              <p>Нет доступных статей</p>
            )}
          </section>

          {/* Популярные статьи */}
          <section className="mb-5">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2>Популярные статьи</h2>
              <Link to="/articles" className="btn btn-outline-primary">
                Все статьи
              </Link>
            </div>
            <Row xs={1} md={3} className="g-4">
              {popularArticles.map(article => (
                <Col key={article.id}>
                  <ArticleCard article={article} />
                </Col>
              ))}
            </Row>
          </section>
        </>
      )}
    </Container>
  );
};

export default HomePage; 