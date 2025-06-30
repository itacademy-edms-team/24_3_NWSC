import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';

const VerifyEmailPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState<'loading'|'success'|'error'|'idle'>('idle');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      setStatus('idle');
      setMessage('');
      return;
    }
    setStatus('loading');
    
    console.log('Attempting to verify email with token:', token);
    
    api.get(`/auth/verify-email?token=${token}`)
      .then(response => {
        console.log('Email verification successful:', response.data);
        if (response.data.message) {
          setStatus('success');
          setMessage(response.data.message);
        } else {
          setStatus('error');
          setMessage('Ошибка подтверждения.');
        }
      })
      .catch(error => {
        console.error('Email verification failed:', error);
        setStatus('error');
        if (error.response) {
          // Сервер ответил с ошибкой
          setMessage(error.response.data?.message || `Ошибка сервера: ${error.response.status}`);
        } else if (error.request) {
          // Запрос был сделан, но ответа не получено
          setMessage('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        } else {
          // Ошибка при настройке запроса
          setMessage('Ошибка при отправке запроса.');
        }
      });
  }, [searchParams]);

  const handleSendConfirmation = async () => {
    setSending(true);
    setMessage('');
    try {
      console.log('Sending confirmation email...');
      const res = await api.post('/auth/send-confirmation-email');
      console.log('Confirmation email sent successfully:', res.data);
      setStatus('success');
      setMessage(res.data.message || 'Письмо отправлено. Проверьте почту.');
    } catch (error: any) {
      console.error('Failed to send confirmation email:', error);
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setStatus('error');
        setMessage('Для отправки письма нужно войти в систему.');
      } else {
        setStatus('error');
        if (error.response?.data?.message) {
          setMessage(error.response.data.message);
        } else if (error.response) {
          setMessage(`Ошибка сервера: ${error.response.status}`);
        } else if (error.request) {
          setMessage('Не удалось подключиться к серверу. Проверьте подключение к интернету.');
        } else {
          setMessage('Ошибка при отправке письма.');
        }
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-email-page">
      <div className="container mt-5">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-center">Подтверждение Email</h3>
              </div>
              <div className="card-body">
                {status === 'loading' && (
                  <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Загрузка...</span>
                    </div>
                    <p className="mt-3">Проверка токена подтверждения...</p>
                  </div>
                )}
                
                {status === 'success' && (
                  <div className="text-center">
                    <i className="bi bi-check-circle text-success" style={{fontSize: '3rem'}}></i>
                    <h4 className="text-success mt-3">Успешно!</h4>
                    <p className="text-success">{message}</p>
                    <a href="/login" className="btn btn-primary">Перейти к входу</a>
                  </div>
                )}
                
                {status === 'error' && (
                  <div className="text-center">
                    <i className="bi bi-exclamation-triangle text-danger" style={{fontSize: '3rem'}}></i>
                    <h4 className="text-danger mt-3">Ошибка</h4>
                    <p className="text-danger">{message}</p>
                    <button onClick={handleSendConfirmation} disabled={sending} className="btn btn-primary">
                      {sending ? 'Отправка...' : 'Отправить новое письмо для подтверждения'}
                    </button>
                  </div>
                )}
                
                {status === 'idle' && (
                  <div className="text-center">
                    <i className="bi bi-envelope text-primary" style={{fontSize: '3rem'}}></i>
                    <h4 className="mt-3">Подтверждение Email</h4>
                    <p>Для подтверждения почты нажмите кнопку ниже:</p>
                    <button onClick={handleSendConfirmation} disabled={sending} className="btn btn-primary">
                      {sending ? 'Отправка...' : 'Отправить письмо для подтверждения'}
                    </button>
                    {message && <p className="mt-3">{message}</p>}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmailPage; 