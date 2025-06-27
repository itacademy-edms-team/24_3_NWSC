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
    fetch(`http://localhost:5181/api/verify-email?token=${token}`)
      .then(async res => {
        const data = await res.json();
        if (res.ok && data.message) {
          setStatus('success');
          setMessage(data.message);
        } else {
          setStatus('error');
          setMessage(data.message || 'Ошибка подтверждения.');
        }
      })
      .catch(() => {
        setStatus('error');
        setMessage('Ошибка подтверждения.');
      });
  }, [searchParams]);

  const handleSendConfirmation = async () => {
    setSending(true);
    setMessage('');
    try {
      const res = await api.post('/auth/send-confirmation-email');
      const data = res.data;
      setStatus('success');
      setMessage(data.message || 'Письмо отправлено. Проверьте почту.');
    } catch (error: any) {
      if (error.response && (error.response.status === 401 || error.response.status === 403)) {
        setStatus('error');
        setMessage('Для отправки письма нужно войти в систему.');
      } else {
        setStatus('error');
        setMessage(error.response?.data?.message || 'Ошибка отправки письма.');
      }
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="verify-email-page">
      {status === 'loading' && <p>Проверка токена...</p>}
      {status === 'success' && <p style={{color: 'green'}}>{message}</p>}
      {status === 'error' && <p style={{color: 'red'}}>{message}</p>}
      {status === 'idle' && (
        <div>
          <p>Для подтверждения почты нажмите кнопку ниже:</p>
          <button onClick={handleSendConfirmation} disabled={sending} className="btn btn-primary">
            {sending ? 'Отправка...' : 'Отправить письмо для подтверждения'}
          </button>
          {message && <p className="mt-3">{message}</p>}
        </div>
      )}
    </div>
  );
};

export default VerifyEmailPage; 