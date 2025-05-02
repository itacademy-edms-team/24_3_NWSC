import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, InputGroup, Pagination, Button } from 'react-bootstrap';
import { ArticleList } from '../types/models';
import { articleService } from '../services/articleService';
import ArticleCard from '../components/ArticleCard';

const ArticlesPage: React.FC = () => {
  const [articleList, setArticleList] = useState<ArticleList | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(9);

  // Загрузка статей при изменении параметров
  useEffect(() => {
    const fetchArticles = async () => {
      try {
        setLoading(true);
        const response = await articleService.getArticles(currentPage, pageSize, searchTerm);
        setArticleList(response);
      } catch (err) {
        console.error('Ошибка загрузки статей:', err);
        setError('Не удалось загрузить статьи. Пожалуйста, попробуйте позже.');
      } finally {
        setLoading(false);
      }
    };

    fetchArticles();
  }, [currentPage, pageSize, searchTerm]);

  // Функция для обработки поиска
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Сбрасываем страницу при новом поиске
  };

  // Функция для построения пагинации
  const renderPagination = () => {
    if (!articleList) return null;

    const { pageCount } = articleList;
    
    // Показываем максимум 5 страниц
    const maxPagesToShow = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2));
    let endPage = Math.min(pageCount, startPage + maxPagesToShow - 1);
    
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1);
    }
    
    const pages = [];
    
    // Добавляем кнопку "Предыдущая"
    pages.push(
      <Pagination.Prev 
        key="prev" 
        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
        disabled={currentPage === 1}
      />
    );
    
    // Добавляем кнопку первой страницы и многоточие если нужно
    if (startPage > 1) {
      pages.push(
        <Pagination.Item key={1} onClick={() => setCurrentPage(1)}>
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        pages.push(<Pagination.Ellipsis key="ellipsis1" />);
      }
    }
    
    // Добавляем номера страниц
    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <Pagination.Item
          key={i}
          active={i === currentPage}
          onClick={() => setCurrentPage(i)}
        >
          {i}
        </Pagination.Item>
      );
    }
    
    // Добавляем многоточие и последнюю страницу если нужно
    if (endPage < pageCount) {
      if (endPage < pageCount - 1) {
        pages.push(<Pagination.Ellipsis key="ellipsis2" />);
      }
      pages.push(
        <Pagination.Item key={pageCount} onClick={() => setCurrentPage(pageCount)}>
          {pageCount}
        </Pagination.Item>
      );
    }
    
    // Добавляем кнопку "Следующая"
    pages.push(
      <Pagination.Next
        key="next"
        onClick={() => setCurrentPage(prev => Math.min(pageCount, prev + 1))}
        disabled={currentPage === pageCount}
      />
    );
    
    return <Pagination>{pages}</Pagination>;
  };

  return (
    <Container>
      <h1 className="mb-4">Статьи</h1>
      
      {/* Форма поиска */}
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
      
      {/* Индикатор загрузки */}
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
      ) : !articleList || articleList.articles.length === 0 ? (
        <div className="alert alert-info" role="alert">
          Нет доступных статей
        </div>
      ) : (
        <>
          {/* Список статей */}
          <Row xs={1} md={2} lg={3} className="g-4 mb-4">
            {articleList.articles.map(article => (
              <Col key={article.id}>
                <ArticleCard article={article} />
              </Col>
            ))}
          </Row>
          
          {/* Пагинация */}
          <div className="d-flex justify-content-center mt-4">
            {renderPagination()}
          </div>
          
          {/* Информация о пагинации */}
          <div className="text-center text-muted mt-2">
            Страница {currentPage} из {articleList.pageCount} | 
            Всего статей: {articleList.totalCount}
          </div>
        </>
      )}
    </Container>
  );
};

export default ArticlesPage; 