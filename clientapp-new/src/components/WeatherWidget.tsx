import React, { useEffect, useState } from 'react';

interface WeatherData {
  name: string;
  main: {
    temp: number;
    humidity: number;
  };
  weather: { description: string; icon: string }[];
  wind: { speed: number };
}

const WeatherWidget: React.FC = () => {
  const [city, setCity] = useState<string>('');
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const res = await fetch('http://ip-api.com/json/');
        const data = await res.json();
        if (data.status === 'success' && data.city) {
          setCity(data.city);
          return data.city;
        } else {
          setError('Не удалось определить город');
          setLoading(false);
        }
      } catch {
        setError('Ошибка при определении местоположения');
        setLoading(false);
      }
    };

    const fetchWeather = async (cityName: string) => {
      try {
        const apiKey = '0ac1c1e4ed8bd44594547f92684093de';
        const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&appid=${apiKey}&units=metric&lang=ru`;
        const res = await fetch(url);
        if (!res.ok) throw new Error('Ошибка получения погоды');
        const data = await res.json();
        setWeather(data);
      } catch {
        setError('Ошибка при получении погоды');
      } finally {
        setLoading(false);
      }
    };

    fetchCity().then((cityName) => {
      if (cityName) fetchWeather(cityName);
    });
  }, []);

  if (loading) return <div>Погода: загрузка...</div>;
  if (error) return <div>Погода: {error}</div>;
  if (!weather) return null;

  return (
    <div className="weather-widget border rounded p-2 mb-2" style={{ maxWidth: 220 }}>
      <div className="d-flex align-items-center mb-1">
        <img
          src={`http://openweathermap.org/img/wn/${weather.weather[0].icon}.png`}
          alt="icon"
          style={{ width: 32, height: 32, marginRight: 8 }}
        />
        <div>
          <div><strong>{weather.name}</strong></div>
          <div>{weather.weather[0].description}</div>
        </div>
      </div>
      <div>Температура: <b>{Math.round(weather.main.temp)}°C</b></div>
      <div>Влажность: {weather.main.humidity}%</div>
      <div>Ветер: {weather.wind.speed} м/с</div>
    </div>
  );
};

export default WeatherWidget; 