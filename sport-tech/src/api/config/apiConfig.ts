// Базовый URL для API
export const API_BASE_URL = 'https://api.sporttech.com/api/v1';

// Режим API: 'mock' или 'real'
export type ApiMode = 'mock' | 'real';

// Типы для заголовков
export interface ApiHeaders {
  'Content-Type': string;
  'Accept': string;
  'Authorization'?: string;
  [key: string]: string | undefined;
}

// Глобальная конфигурация API
export const API_CONFIG = {
  // Текущий режим работы API (по умолчанию используем mock)
  mode: 'mock' as ApiMode,
  
  // Таймаут для запросов (мс)
  timeout: 10000,
  
  // Заголовки по умолчанию
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  } as ApiHeaders
};

// Функция для переключения режима API
export const setApiMode = (mode: ApiMode): void => {
  API_CONFIG.mode = mode;
  console.log(`API режим изменен на: ${mode}`);
};

// Функция для получения текущего режима API
export const getApiMode = (): ApiMode => {
  return API_CONFIG.mode;
};

// Функция для получения заголовков с учетом авторизации
export const getHeaders = (authToken?: string): ApiHeaders => {
  const headers = { ...API_CONFIG.headers };
  
  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }
  
  return headers;
};

// Обработчик ошибок API
export const handleApiError = (error: any): never => {
  // Логирование ошибки
  console.error('API ошибка:', error);
  
  // Форматирование для однообразного вывода ошибок
  const formattedError = {
    message: error.message || 'Неизвестная ошибка API',
    status: error.status || 500,
    details: error.details || {}
  };
  
  throw formattedError;
}; 