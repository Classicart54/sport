import { BaseApiService } from './baseApiService';
import { ReviewApiService as IReviewApiService, CreateReviewDto } from '../interfaces/apiInterfaces';
import { Review } from '../../types/interfaces';
import { API_CONFIG } from '../config/apiConfig';

/**
 * Сервис для работы с отзывами
 */
export class ReviewApiService extends BaseApiService<Review, CreateReviewDto> implements IReviewApiService {
  protected endpoint = 'reviews';
  
  // Моковые данные для отзывов
  protected mockData: Review[] = [];
  
  protected getMockStorageKey(): string {
    return 'mockReviews';
  }
  
  /**
   * Переопределение метода сохранения мок-данных
   */
  protected saveMockData(): void {
    super.saveMockData(this.mockData);
  }
  
  /**
   * Получение отзывов для конкретного продукта
   * @param productId ID продукта
   */
  async getProductReviews(productId: number): Promise<Review[]> {
    if (API_CONFIG.mode === 'mock') {
      try {
        // Загружаем актуальные данные из хранилища и используем возвращаемый массив
        const reviews = this.loadMockData();
        const productReviews = reviews.filter(review => review.productId === productId);
        return Promise.resolve(productReviews);
      } catch (error) {
        console.error('Ошибка при получении отзывов:', error);
        return Promise.reject({ message: 'Ошибка при получении отзывов' });
      }
    } else {
      return this.request<Review[]>('GET', `/${this.endpoint}/product/${productId}`, undefined);
    }
  }
  
  /**
   * Добавление нового отзыва
   * @param reviewData Данные отзыва
   */
  async addReview(reviewData: Omit<Review, 'id' | 'date'>): Promise<Review> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const reviews = this.loadMockData();
        
        const newReview: Review = {
          id: reviews.length ? Math.max(...reviews.map(review => review.id)) + 1 : 1,
          date: new Date().toISOString(),
          ...reviewData
        };
        
        this.mockData = [...reviews, newReview];
        this.saveMockData();
        
        return Promise.resolve(newReview);
      } catch (error) {
        console.error('Ошибка при добавлении отзыва:', error);
        return Promise.reject({ message: 'Ошибка при добавлении отзыва' });
      }
    } else {
      return this.request<Review>('POST', `/${this.endpoint}`, reviewData);
    }
  }
  
  /**
   * Получение среднего рейтинга продукта
   * @param productId ID продукта
   */
  async getProductRating(productId: number): Promise<{ rating: number; count: number }> {
    if (API_CONFIG.mode === 'mock') {
      try {
        // Загружаем актуальные данные из хранилища и используем возвращаемый массив
        const reviews = this.loadMockData();
        const productReviews = reviews.filter(review => review.productId === productId);
        
        if (productReviews.length === 0) {
          return Promise.resolve({ rating: 0, count: 0 });
        }
        
        const totalRating = productReviews.reduce((total, review) => total + review.rating, 0);
        const averageRating = totalRating / productReviews.length;
        
        return Promise.resolve({ 
          rating: Number(averageRating.toFixed(1)), 
          count: productReviews.length 
        });
      } catch (error) {
        console.error('Ошибка при получении рейтинга:', error);
        return Promise.reject({ message: 'Ошибка при получении рейтинга продукта' });
      }
    } else {
      return this.request<{ rating: number; count: number }>('GET', `/${this.endpoint}/product/${productId}/rating`, undefined);
    }
  }
} 