import React, { useEffect, useState } from 'react';

const CurrencyWidget: React.FC = () => {
  const [rate, setRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRate = async () => {
      try {
        const apiKey = '87d6bdfaf3ced601b45cc7f2';
        const url = `https://v6.exchangerate-api.com/v6/${apiKey}/latest/USD`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Ошибка получения курса');
        const data = await res.json();
        if (data && data.conversion_rates && data.conversion_rates.RUB) {
          setRate(data.conversion_rates.RUB);
        } else {
          setError('Нет данных по курсу');
        }
      } catch {
        setError('Ошибка при получении курса');
      } finally {
        setLoading(false);
      }
    };
    fetchRate();
  }, []);

  if (loading) return <div>Курс доллара: загрузка...</div>;
  if (error) return <div>Курс доллара: {error}</div>;
  if (rate === null) return null;

  return (
    <div className="currency-widget border rounded p-2 mb-2" style={{ maxWidth: 220 }}>
      <div className="d-flex align-items-center mb-1">
        <img src="https://flagcdn.com/us.svg" alt="USD" style={{ width: 20, marginRight: 6 }} />
        <span className="me-1">1 USD</span>
        <span className="me-1">=</span>
        <img src="https://flagcdn.com/ru.svg" alt="RUB" style={{ width: 20, marginRight: 6 }} />
        <span><b>{rate.toFixed(2)} RUB</b></span>
      </div>
    </div>
  );
};

export { CurrencyWidget }; 