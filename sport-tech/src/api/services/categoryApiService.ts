import { BaseApiService } from './baseApiService';
import { Category, Product } from '../../types/interfaces';
import { CategoryApiService as ICategoryApiService } from '../interfaces/apiInterfaces';
import { API_CONFIG } from '../config/apiConfig';
import { PaginatedResponse, QueryParams } from '../interfaces/baseApiInterface';

/**
 * Сервис для работы с категориями
 */
export class CategoryApiService extends BaseApiService<Category> implements ICategoryApiService {
  protected endpoint = 'categories';
  protected mockData: Category[] = [];
  
  constructor() {
    super();
  }
  
  /**
   * Получение ключа хранения для localStorage
   */
  protected getMockStorageKey(): string {
    return 'sport_tech_categories';
  }
  
  /**
   * Получение списка категорий с пагинацией и фильтрацией
   */
  async getFiltered(params: QueryParams): Promise<PaginatedResponse<Category>> {
    const allCategories = await this.getAll();
    
    // Фильтрация по названию, если указано
    let filteredCategories = allCategories;
    if (params.search) {
      const searchQuery = params.search.toLowerCase();
      filteredCategories = filteredCategories.filter(category => 
        category.name.toLowerCase().includes(searchQuery)
      );
    }
    
    // Сортировка
    if (params.sort) {
      const sortField = params.sort as keyof Category;
      const direction = params.order === 'desc' ? -1 : 1;
      
      filteredCategories.sort((a, b) => {
        const valueA = a[sortField];
        const valueB = b[sortField];
        
        if (valueA !== undefined && valueB !== undefined) {
          if (valueA < valueB) return -1 * direction;
          if (valueA > valueB) return 1 * direction;
        }
        else if (valueA === undefined && valueB !== undefined) {
          return direction;
        }
        else if (valueA !== undefined && valueB === undefined) {
          return -1 * direction;
        }
        
        return 0;
      });
    }
    
    // Пагинация
    const page = Number(params.page) || 1;
    const pageSize = Number(params.pageSize) || 10;
    const total = filteredCategories.length;
    
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    const items = filteredCategories.slice(start, end);
    
    return {
      items,
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize)
    };
  }
  
  /**
   * Получение товаров по категории
   */
  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока получаем данные из localStorage
      try {
        const storedProducts = localStorage.getItem('sport_tech_products');
        if (storedProducts) {
          const products: Product[] = JSON.parse(storedProducts);
          return products.filter(product => product.categoryId === categoryId);
        }
        return [];
      } catch (error) {
        console.error('Ошибка при получении товаров по категории:', error);
        return [];
      }
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<Product[]>('GET', `/${this.endpoint}/${categoryId}/products`);
    }
  }
} 