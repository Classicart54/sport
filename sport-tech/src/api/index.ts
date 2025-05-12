/**
 * Точка входа API сервисов
 *
 * Этот файл экспортирует все API сервисы и позволяет централизованно
 * управлять режимом работы (моки или реальный сервер).
 */

import { API_CONFIG, setApiMode, getApiMode, ApiMode } from './config/apiConfig';
import { ProductApiService } from './services/productApiService';
import { CategoryApiService } from './services/categoryApiService';
import { AuthApiService } from './services/authApiService';
import { ReviewApiService } from './services/reviewApiService';
import { OrderApiService } from './services/orderApiService';

// Экспортируем тип режима API
export type { ApiMode };

// Экспортируем классы сервисов
export { 
  ProductApiService, 
  CategoryApiService, 
  AuthApiService, 
  ReviewApiService,
  OrderApiService
};

// Экспортируем настроенные экземпляры сервисов
export const productService = new ProductApiService();
export const categoryService = new CategoryApiService();
export const authService = new AuthApiService();
export const reviewService = new ReviewApiService();
export const orderService = new OrderApiService();

// Экспортируем централизованный объект API
export const apiService = {
  products: productService,
  categories: categoryService,
  auth: authService,
  reviews: reviewService,
  orders: orderService
};

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