import React, { useState, useEffect } from 'react';
import { Row, Col, Form, InputGroup, Button, Pagination } from 'react-bootstrap';
import { useSearchParams } from 'react-router-dom';
import { getArticles } from '../services/articleService';
import { Article, ArticleList } from '../types/models';
import ArticleCard from '../components/ArticleCard';

const ArticlesPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [pagination, setPagination] = useState({
    currentPage: parseInt(searchParams.get('page') || '1', 10),
    pageSize: 9,
    totalCount: 0,
    pageCount: 0
  });

  useEffect(() => {
    fetchArticles();
  }, [pagination.currentPage, searchTerm]);

  const fetchArticles = async () => {
    setLoading(true);
    try {
      const data = await getArticles(pagination.currentPage, pagination.pageSize, searchTerm);
      setArticles(data.articles);
      setPagination({
        ...pagination,
        totalCount: data.totalCount,
        pageCount: data.pageCount
      });
    } catch (error) {
      console.error('Error fetching articles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Обновляем URL параметры
    const params: { [key: string]: string } = { page: '1' };
    if (searchTerm) params.search = searchTerm;
    
    setSearchParams(params);
    setPagination({
      ...pagination,
      currentPage: 1
    });
  };

  const handlePageChange = (page: number) => {
    const params: { [key: string]: string } = { page: page.toString() };
    if (searchTerm) params.search = searchTerm;
    
    setSearchParams(params);
    setPagination({
      ...pagination,
      currentPage: page
    });
    
    // Прокрутка вверх страницы
    window.scrollTo(0, 0);
  };

  // Генерация элементов пагинации
  const renderPagination = () => {
    const items = [];
    const maxPages = 5; // Максимальное количество видимых страниц в пагинации
    
    // Добавляем первую страницу и "..."
    if (pagination.currentPage > 3) {
      items.push(
        <Pagination.Item key={1} onClick={() => handlePageChange(1)}>
          1
        </Pagination.Item>
      );
      items.push(<Pagination.Ellipsis key="ellipsis-1" />);
    }
    
    // Добавляем страницы вокруг текущей
    for (
      let i = Math.max(1, pagination.currentPage - 2);
      i <= Math.min(pagination.pageCount, pagination.currentPage + 2);
      i++
    ) {
      items.push(
        <Pagination.Item
          key={i}
          active={i === pagination.currentPage}
          onClick={() => handlePageChange(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Добавляем "..." и последнюю страницу
    if (pagination.currentPage < pagination.pageCount - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis-2" />);
      items.push(
        <Pagination.Item
          key={pagination.pageCount}
          onClick={() => handlePageChange(pagination.pageCount)}
        >
          {pagination.pageCount}
        </Pagination.Item>
      );
    }
    
    return (
      <Pagination className="justify-content-center">
        <Pagination.Prev
          onClick={() => handlePageChange(pagination.currentPage - 1)}
          disabled={pagination.currentPage === 1}
        />
        {items}
        <Pagination.Next
          onClick={() => handlePageChange(pagination.currentPage + 1)}
          disabled={pagination.currentPage === pagination.pageCount}
        />
      </Pagination>
    );
  };

  return (
    <div className="articles-page">
      <h1 className="mb-4">Статьи</h1>
      
      <Form onSubmit={handleSearch} className="mb-4">
        <InputGroup>
          <Form.Control
            type="text"
            placeholder="Поиск статей..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button variant="primary" type="submit">
            Поиск
          </Button>
        </InputGroup>
      </Form>
      
      {loading ? (
        <div className="text-center py-5">Загрузка...</div>
      ) : (
        <>
          {articles.length === 0 ? (
            <div className="text-center py-5">
              <h3>Статьи не найдены</h3>
              <p>Попробуйте изменить параметры поиска</p>
            </div>
          ) : (
            <>
              <Row>
                {articles.map(article => (
                  <Col md={4} key={article.id} className="mb-4">
                    <ArticleCard article={article} />
                  </Col>
                ))}
              </Row>
              
              {pagination.pageCount > 1 && renderPagination()}
            </>
          )}
        </>
      )}
    </div>
  );
};

export default ArticlesPage; 