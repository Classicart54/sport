import { BaseApiService, ExtendedApiService, QueryParams, PaginatedResponse } from './baseApiInterface';
import { Product, Category, User, Review, CartItem } from '../../types/interfaces';
import { Order, OrderItem } from '../../context/OrderContext';

/**
 * Интерфейс для работы с категориями товаров
 */
export interface CategoryApiService extends ExtendedApiService<Category> {
  /**
   * Получение товаров по категории
   * @param categoryId ID категории
   */
  getProductsByCategory(categoryId: number): Promise<Product[]>;
}

/**
 * Интерфейс для работы с товарами
 */
export interface ProductApiService extends ExtendedApiService<Product> {
  /**
   * Поиск товаров по названию
   * @param query Поисковый запрос
   */
  searchProducts(query: string): Promise<Product[]>;
  
  /**
   * Получение рекомендуемых товаров
   * @param limit Лимит товаров
   */
  getFeaturedProducts(limit?: number): Promise<Product[]>;
  
  /**
   * Получение товаров со скидкой
   * @param limit Лимит товаров
   */
  getDiscountedProducts(limit?: number): Promise<Product[]>;
}

/**
 * Данные для регистрации пользователя
 */
export interface UserRegisterDto {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  city?: string;
}

/**
 * Данные для входа пользователя
 */
export interface UserLoginDto {
  email: string;
  password: string;
}

/**
 * Ответ на успешную аутентификацию
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Интерфейс для работы с пользователями и аутентификацией
 */
export interface AuthApiService {
  /**
   * Регистрация нового пользователя
   * @param userData Данные пользователя
   */
  register(userData: UserRegisterDto): Promise<AuthResponse>;
  
  /**
   * Вход пользователя
   * @param credentials Учетные данные
   */
  login(credentials: UserLoginDto): Promise<AuthResponse>;
  
  /**
   * Проверка токена аутентификации
   */
  validateToken(): Promise<User>;
  
  /**
   * Выход пользователя
   */
  logout(): Promise<boolean>;
  
  /**
   * Обновление профиля пользователя
   * @param userData Данные пользователя
   */
  updateProfile(userData: Partial<User>): Promise<User>;
  
  /**
   * Получение списка всех пользователей (только для администраторов)
   */
  getAllUsers(): Promise<User[]>;
}

/**
 * Данные для создания отзыва
 */
export interface CreateReviewDto {
  productId: number;
  rating: number;
  text: string;
}

/**
 * Интерфейс для работы с отзывами
 */
export interface ReviewApiService extends BaseApiService<Review, CreateReviewDto> {
  /**
   * Получение отзывов для конкретного товара
   * @param productId ID товара
   */
  getProductReviews(productId: number): Promise<Review[]>;
  
  /**
   * Расчет среднего рейтинга товара
   * @param productId ID товара
   */
  getProductRating(productId: number): Promise<{ rating: number; count: number }>;
}

/**
 * Данные для создания заказа
 */
export interface CreateOrderDto {
  items: Omit<OrderItem, 'id'>[];
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  rentalDays: number;
}

/**
 * Интерфейс для работы с заказами
 */
export interface OrderApiService extends BaseApiService<Order, CreateOrderDto> {
  /**
   * Получение заказов конкретного пользователя
   * @param userId ID пользователя
   */
  getUserOrders(userId: number): Promise<Order[]>;
  
  /**
   * Обновление статуса заказа
   * @param orderId ID заказа
   * @param status Новый статус
   */
  updateOrderStatus(orderId: number, status: 'active' | 'completed' | 'cancelled'): Promise<boolean>;
}

/**
 * Интерфейс для работы с корзиной покупок
 */
export interface CartApiService {
  /**
   * Получение текущей корзины пользователя
   */
  getCart(): Promise<CartItem[]>;
  
  /**
   * Добавление товара в корзину
   * @param productId ID товара
   * @param quantity Количество
   * @param days Количество дней аренды
   */
  addToCart(productId: number, quantity: number, days: number): Promise<CartItem[]>;
  
  /**
   * Обновление товара в корзине
   * @param productId ID товара
   * @param quantity Новое количество
   * @param days Новое количество дней
   */
  updateCartItem(productId: number, quantity: number, days: number): Promise<CartItem[]>;
  
  /**
   * Удаление товара из корзины
   * @param productId ID товара
   */
  removeFromCart(productId: number): Promise<CartItem[]>;
  
  /**
   * Очистка корзины
   */
  clearCart(): Promise<boolean>;
} 