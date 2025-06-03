// Базовый URL API сервера (используем тот же что и в api.ts)
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5181';

/**
 * Конвертирует относительный путь изображения в полный URL
 * @param imagePath - относительный путь изображения из базы данных
 * @returns полный URL изображения
 */
export const getImageUrl = (imagePath: string | null | undefined): string | null => {
  if (!imagePath) {
    return null;
  }
  
  // Если путь уже полный URL, возвращаем как есть
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  
  // Убираем начальный слеш если есть и добавляем к базовому URL
  const cleanPath = imagePath.startsWith('/') ? imagePath.substring(1) : imagePath;
  const fullUrl = `${API_BASE_URL}/${cleanPath}`;
  
  // Логирование для отладки
  console.log('Image URL conversion:', {
    originalPath: imagePath,
    cleanPath: cleanPath,
    apiBaseUrl: API_BASE_URL,
    finalUrl: fullUrl
  });
  
  return fullUrl;
};

/**
 * Проверяет, является ли URL изображения действительным
 * @param imageUrl - URL изображения
 * @returns Promise<boolean>
 */
export const isImageValid = async (imageUrl: string): Promise<boolean> => {
  try {
    console.log('Checking image validity for:', imageUrl);
    const response = await fetch(imageUrl, { method: 'HEAD' });
    const contentType = response.headers.get('content-type');
    const isValid = response.ok && (contentType?.startsWith('image/') ?? false);
    
    console.log('Image validation result:', {
      url: imageUrl,
      status: response.status,
      contentType: contentType,
      isValid: isValid
    });
    
    return isValid;
  } catch (error) {
    console.error('Error validating image:', imageUrl, error);
    return false;
  }
}; 