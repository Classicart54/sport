import { BaseApiService } from './baseApiService';
import { Product } from '../../types/interfaces';
import { ProductApiService as IProductApiService } from '../interfaces/apiInterfaces';
import { PaginatedResponse, QueryParams } from '../interfaces/baseApiInterface';
import { API_CONFIG } from '../config/apiConfig';

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
        // Если данных нет, инициализируем тестовые данные
        this.initializeMockData();
      }
    } catch (error) {
      console.error('Ошибка при загрузке товаров в конструкторе:', error);
      this.initializeMockData();
    }
  }
  
  /**
   * Инициализация тестовых данных
   */
  private initializeMockData(): void {
    // Тестовые товары
    this.mockData = [
      {
        id: 1,
        categoryId: 1,
        name: 'Велосипед горный',
        price: 500,
        image: 'https://via.placeholder.com/300x200?text=Bike',
        description: 'Отличный горный велосипед для активного отдыха'
      },
      {
        id: 2,
        categoryId: 1,
        name: 'Велосипед городской',
        price: 300,
        image: 'https://via.placeholder.com/300x200?text=City+Bike',
        description: 'Комфортный городской велосипед'
      },
      {
        id: 3,
        categoryId: 2,
        name: 'Роликовые коньки',
        price: 200,
        image: 'https://via.placeholder.com/300x200?text=Roller+Skates',
        description: 'Современные роликовые коньки'
      },
      {
        id: 4,
        categoryId: 2,
        name: 'Скейтборд',
        price: 250,
        image: 'https://via.placeholder.com/300x200?text=Skateboard',
        description: 'Профессиональный скейтборд'
      }
    ];

    // Сохраняем товары в localStorage
    localStorage.setItem('sport_tech_products', JSON.stringify(this.mockData));

    // Тестовые отзывы
    const mockReviews = [
      {
        id: 1,
        productId: 1,
        userId: 1,
        author: 'Иван',
        rating: 5,
        date: '2024-03-15',
        text: 'Отличный велосипед!'
      },
      {
        id: 2,
        productId: 1,
        userId: 2,
        author: 'Петр',
        rating: 4,
        date: '2024-03-14',
        text: 'Хороший велосипед, но дорогой'
      },
      {
        id: 3,
        productId: 2,
        userId: 3,
        author: 'Анна',
        rating: 5,
        date: '2024-03-13',
        text: 'Отличный городской велосипед'
      },
      {
        id: 4,
        productId: 3,
        userId: 4,
        author: 'Мария',
        rating: 3,
        date: '2024-03-12',
        text: 'Нормальные коньки'
      }
    ];

    // Сохраняем отзывы в localStorage, используя правильный ключ
    localStorage.setItem('sport-tech-reviews', JSON.stringify(mockReviews));
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
   * Получение товаров с лучшим рейтингом
   * @param limit Максимальное количество товаров
   */
  async getBestRatedProducts(limit: number = 6): Promise<Product[]> {
    if (API_CONFIG.mode === 'mock') {
      try {
        // Получаем все товары
        const allProducts = await this.getAll();
        
        // Если нет товаров, возвращаем пустой массив
        if (!allProducts || allProducts.length === 0) {
          console.warn('Нет доступных товаров');
          return [];
        }
        
        // Получаем АКТУАЛЬНЫЕ отзывы из localStorage (не используем кешированные)
        // Ключ 'sport-tech-reviews' используется в ReviewsContext
        const storedReviews = localStorage.getItem('sport-tech-reviews');
        console.log('Получаем отзывы из localStorage:', storedReviews ? 'Найдены отзывы' : 'Отзывы не найдены');
        
        if (!storedReviews) {
          console.warn('Нет отзывов в localStorage, возвращаем случайные товары');
          return this.getFeaturedProducts(limit);
        }
        
        let reviews;
        try {
          reviews = JSON.parse(storedReviews);
          console.log(`Количество отзывов: ${Array.isArray(reviews) ? reviews.length : 'неизвестно'}`);
          
          if (!Array.isArray(reviews)) {
            throw new Error('Отзывы не являются массивом');
          }
        } catch (error) {
          console.error('Ошибка при парсинге отзывов:', error);
          return this.getFeaturedProducts(limit);
        }
        
        // Рассчитываем средний рейтинг для каждого товара
        const productRatings: { [key: number]: { totalRating: number; count: number } } = {};
        
        // Подсчитываем рейтинги из ВСЕХ отзывов
        reviews.forEach((review: any) => {
          if (!review || typeof review.productId !== 'number' || typeof review.rating !== 'number') {
            return; // Пропускаем некорректные отзывы
          }
          
          const productId = review.productId;
          if (!productRatings[productId]) {
            productRatings[productId] = { totalRating: 0, count: 0 };
          }
          productRatings[productId].totalRating += review.rating;
          productRatings[productId].count += 1;
        });
        
        console.log('Рейтинги товаров:', productRatings);
        
        // Фильтруем товары, у которых есть хотя бы один отзыв
        const productsWithRatings = allProducts.filter(product => 
          productRatings[product.id] && productRatings[product.id].count > 0
        );
        
        console.log(`Найдено товаров с отзывами: ${productsWithRatings.length}`);
        
        // Если нет товаров с рейтингами, возвращаем случайные товары
        if (productsWithRatings.length === 0) {
          console.warn('Нет товаров с рейтингами, возвращаем случайные товары');
          return this.getFeaturedProducts(limit);
        }
        
        // Сортируем по среднему рейтингу (от высокого к низкому)
        const sortedProducts = productsWithRatings.sort((a, b) => {
          const ratingA = productRatings[a.id].totalRating / productRatings[a.id].count;
          const ratingB = productRatings[b.id].totalRating / productRatings[b.id].count;
          return ratingB - ratingA;
        });
        
        const result = sortedProducts.slice(0, limit);
        console.log('Возвращаем топ товаров по рейтингу:', 
          result.map(p => ({ id: p.id, name: p.name, rating: productRatings[p.id].totalRating / productRatings[p.id].count }))
        );
        
        return result;
      } catch (error) {
        console.error('Ошибка при получении товаров с лучшим рейтингом:', error);
        return this.getFeaturedProducts(limit);
      }
    } else {
      // В реальном API делаем запрос к /products/best-rated?limit=${limit}
      return this.request<Product[]>('GET', `/${this.endpoint}/best-rated?limit=${limit}`);
    }
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