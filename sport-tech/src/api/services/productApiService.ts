import { BaseApiService } from './baseApiService';
import { Product } from '../../types/interfaces';
import { ProductApiService as IProductApiService } from '../interfaces/apiInterfaces';
import { PaginatedResponse, QueryParams } from '../interfaces/baseApiInterface';

/**
 * Сервис для работы с товарами
 */
export class ProductApiService extends BaseApiService<Product> implements IProductApiService {
  protected endpoint = 'products';
  protected mockData: Product[] = [];
  
  constructor() {
    super();
    // В конструкторе инициализируем мок-данные
    try {
      // Пытаемся получить товары из localStorage
      const storedProducts = localStorage.getItem('sport_tech_products');
      if (storedProducts) {
        this.mockData = JSON.parse(storedProducts);
      } else {
        // Если данных нет, используем пустой массив (данные загрузятся в loadMockData)
        this.mockData = [];
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров в конструкторе:', error);
      this.mockData = [];
    }
  }
  
  /**
   * Получение ключа хранения для localStorage
   */
  protected getMockStorageKey(): string {
    return 'sport_tech_products';
  }
  
  /**
   * Поиск товаров по названию
   */
  async searchProducts(query: string): Promise<Product[]> {
    const allProducts = await this.getAll();
    
    if (!query) return allProducts;
    
    const searchQuery = query.toLowerCase();
    
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(searchQuery)
    );
  }
  
  /**
   * Получение списка товаров с пагинацией и фильтрацией
   */
  async getFiltered(params: QueryParams): Promise<PaginatedResponse<Product>> {
    const allProducts = await this.getAll();
    
    // Фильтрация по категории, если указано
    let filteredProducts = params.categoryId 
      ? allProducts.filter(product => product.categoryId === Number(params.categoryId)) 
      : allProducts;
    
    // Поиск по названию, если указано
    if (params.search) {
      const searchQuery = params.search.toLowerCase();
      filteredProducts = filteredProducts.filter(product => 
        product.name.toLowerCase().includes(searchQuery)
      );
    }
    
    // Сортировка
    if (params.sort) {
      const sortField = params.sort as keyof Product;
      const direction = params.order === 'desc' ? -1 : 1;
      
      filteredProducts.sort((a, b) => {
        // Безопасное сравнение с проверкой на undefined
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        // Если оба значения определены
        if (valueA !== undefined && valueB !== undefined) {
          if (valueA < valueB) return -1 * direction;
          if (valueA > valueB) return 1 * direction;
        }
        // Если только одно из значений не определено
        else if (valueA === undefined && valueB !== undefined) {
          return direction; // Неопределенные значения в конец при сортировке по возрастанию
        }
        else if (valueA !== undefined && valueB === undefined) {
          return -1 * direction; // Неопределенные значения в конец при сортировке по возрастанию
        }
        
        return 0;
      });
    }
    
    // Пагинация
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const total = filteredProducts.length;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredProducts.slice(start, end);
    
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize)
    };
  }
  
  /**
   * Получение рекомендуемых товаров
   */
  async getFeaturedProducts(limit: number = 6): Promise<Product[]> {
    const allProducts = await this.getAll();
    
    // В реальном API здесь был бы запрос к /products/featured?limit=${limit}
    // В моковом варианте просто берем первые N элементов
    return allProducts.slice(0, limit);
  }
  
  /**
   * Получение товаров со скидкой
   */
  async getDiscountedProducts(limit: number = 6): Promise<Product[]> {
    const allProducts = await this.getAll();
    
    // В реальном API здесь был бы запрос к /products/discounted?limit=${limit}
    // В моковом варианте просто берем случайные N элементов
    const shuffled = [...allProducts].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, limit);
  }
} 