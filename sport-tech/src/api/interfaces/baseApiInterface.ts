/**
 * Базовый интерфейс API сервиса
 * 
 * Этот интерфейс определяет общие методы для работы с CRUD операциями.
 * Каждый конкретный сервис API должен расширять этот интерфейс.
 */
export interface BaseApiService<T, CreateDto = Omit<T, 'id'>, UpdateDto = Partial<Omit<T, 'id'>>> {
  /**
   * Получение списка всех элементов
   */
  getAll(): Promise<T[]>;
  
  /**
   * Получение элемента по идентификатору
   * @param id Идентификатор элемента
   */
  getById(id: number): Promise<T>;
  
  /**
   * Создание нового элемента
   * @param data Данные для создания элемента
   */
  create(data: CreateDto): Promise<T>;
  
  /**
   * Обновление существующего элемента
   * @param id Идентификатор элемента
   * @param data Данные для обновления
   */
  update(id: number, data: UpdateDto): Promise<T>;
  
  /**
   * Удаление элемента
   * @param id Идентификатор элемента
   */
  delete(id: number): Promise<boolean>;
}

/**
 * Расширенный интерфейс с возможностью фильтрации и пагинации
 */
export interface ExtendedApiService<T, CreateDto = Omit<T, 'id'>, UpdateDto = Partial<Omit<T, 'id'>>> extends BaseApiService<T, CreateDto, UpdateDto> {
  /**
   * Получение списка элементов с пагинацией и фильтрацией
   * @param params Параметры запроса (фильтры, сортировка, пагинация)
   */
  getFiltered(params: QueryParams): Promise<PaginatedResponse<T>>;
}

/**
 * Интерфейс для пагинированного ответа
 */
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

/**
 * Параметры для запросов с фильтрацией и пагинацией
 */
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: any;
}

/**
 * Базовая структура ответа API
 */
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
    details?: any;
  };
}

/**
 * Коды ошибок API
 */
export enum ApiErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
} 