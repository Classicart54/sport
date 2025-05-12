import { BaseApiService } from './baseApiService';
import { OrderApiService as IOrderApiService } from '../interfaces/apiInterfaces';
import { Order } from '../../context/OrderContext';
import { CreateOrderDto } from '../interfaces/apiInterfaces';
import { API_CONFIG } from '../config/apiConfig';

/**
 * API сервис для работы с заказами
 */
export class OrderApiService extends BaseApiService<Order, CreateOrderDto> implements IOrderApiService {
  protected endpoint = 'orders';
  protected mockData: Order[] = [];
  
  protected getMockStorageKey(): string {
    return 'sport_tech_orders';
  }
  
  /**
   * Получение заказов конкретного пользователя
   * @param userId ID пользователя
   */
  async getUserOrders(userId: number): Promise<Order[]> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока выбираем заказы с указанным userId
      const userOrders = this.mockData.filter(order => 
        order.contactInfo && 
        typeof order.contactInfo.userId === 'number' && 
        order.contactInfo.userId === userId
      );
      
      return Promise.resolve([...userOrders]);
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<Order[]>('GET', `/${this.endpoint}/user/${userId}`);
    }
  }
  
  /**
   * Обновление статуса заказа
   * @param orderId ID заказа
   * @param status Новый статус
   */
  async updateOrderStatus(orderId: number, status: Order['status']): Promise<boolean> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока находим и обновляем заказ
      const orderIndex = this.mockData.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        throw {
          status: 404,
          message: `Заказ с ID ${orderId} не найден`,
          details: {}
        };
      }
      
      // Обновляем статус заказа
      this.mockData[orderIndex].status = status;
      this.saveMockData(this.mockData);
      
      return Promise.resolve(true);
    } else {
      // В реальном режиме делаем запрос к API
      await this.request<void>('PATCH', `/${this.endpoint}/${orderId}/status`, { status });
      return Promise.resolve(true);
    }
  }

  /**
   * Инициализация мок-данными из localStorage
   * Этот метод синхронизирует данные заказов между OrderContext и API сервисом
   */
  syncOrdersWithContext(): void {
    try {
      const storedOrders = localStorage.getItem('sport_tech_orders');
      if (storedOrders) {
        const parsedOrders = JSON.parse(storedOrders);
        if (Array.isArray(parsedOrders)) {
          this.mockData = parsedOrders;
          return;
        }
      }
    } catch (error) {
      console.error('Ошибка при синхронизации заказов с контекстом:', error);
    }
  }
} 