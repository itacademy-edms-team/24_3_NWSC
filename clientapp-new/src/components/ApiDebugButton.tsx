import React from 'react';
import { Button, OverlayTrigger, Tooltip } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBug } from '@fortawesome/free-solid-svg-icons';

interface ApiDebugButtonProps {
  endpoint: string;
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: object;
  title?: string;
  includeAuth?: boolean;
}

const ApiDebugButton: React.FC<ApiDebugButtonProps> = ({ 
  endpoint, 
  method = 'GET', 
  body = {},
  title = 'Отладка API',
  includeAuth = true
}) => {
  const handleClick = () => {
    // Получаем токен, если нужно включить авторизацию
    const token = includeAuth ? localStorage.getItem('token') : null;
    const userId = localStorage.getItem('userId');
    
    // Если в теле запроса есть поле authorId и оно пустое, заполняем его текущим userId
    let finalBody = { ...body };
    if (finalBody && 'authorId' in finalBody && (!finalBody.authorId || finalBody.authorId === '')) {
      finalBody.authorId = userId || '';
    }
    
    // Сохраняем параметры запроса в sessionStorage
    sessionStorage.setItem('debug_endpoint', endpoint);
    sessionStorage.setItem('debug_method', method);
    sessionStorage.setItem('debug_body', JSON.stringify(finalBody, null, 2));
    
    // Если есть токен и нужно включить авторизацию, сохраняем его тоже
    if (token && includeAuth) {
      sessionStorage.setItem('debug_auth_token', token);
    }
    
    // Открываем страницу отладки в новом окне
    window.open('/api-debug', '_blank');
  };
  
  const renderTooltip = (props: any) => (
    <Tooltip id="api-debug-tooltip" {...props}>
      Открыть отладчик API для вызова {method} {endpoint}
      {includeAuth && ' с авторизацией'}
    </Tooltip>
  );
  
  return (
    <OverlayTrigger
      placement="top"
      delay={{ show: 400, hide: 100 }}
      overlay={renderTooltip}
    >
      <Button 
        variant="outline-info" 
        size="sm" 
        onClick={handleClick}
        className="ms-2"
      >
        <FontAwesomeIcon icon={faBug} /> {title}
      </Button>
    </OverlayTrigger>
  );
};

export default ApiDebugButton; 