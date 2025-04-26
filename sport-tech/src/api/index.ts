/**
 * Точка входа API сервисов
 *
 * Этот файл экспортирует все API сервисы и позволяет централизованно
 * управлять режимом работы (моки или реальный сервер).
 */

import { API_CONFIG, setApiMode, getApiMode, ApiMode } from './config/apiConfig';
import { ProductApiService } from './services/productApiService';

// Экспортируем тип режима API
export type { ApiMode };

// Экспортируем класс сервиса товаров
export { ProductApiService };

// Экспортируем настроенные экземпляры сервисов
export const productService = new ProductApiService();

/**
 * Переключение между моковым и реальным режимом API
 * @param mode Режим API ('mock' или 'real')
 */
export function switchApiMode(mode: ApiMode): void {
  setApiMode(mode);
  console.log(`API режим переключен на: ${mode}`);
}

/**
 * Получение текущего режима API
 * @returns Текущий режим API
 */
export function getCurrentApiMode(): ApiMode {
  return getApiMode();
}

/**
 * Проверка, работает ли API в моковом режиме
 * @returns true, если API в моковом режиме
 */
export function isMockMode(): boolean {
  return getApiMode() === 'mock';
}

/**
 * Проверка, работает ли API в реальном режиме
 * @returns true, если API в реальном режиме
 */
export function isRealMode(): boolean {
  return getApiMode() === 'real';
} 