import { BaseApiService as IBaseApiService } from '../interfaces/baseApiInterface';
import { API_CONFIG, API_BASE_URL, getHeaders, handleApiError, ApiHeaders } from '../config/apiConfig';

/**
 * Базовая реализация API-сервиса
 * 
 * Абстрактный класс, содержащий общую логику для API-запросов.
 * Конкретные сервисы должны наследоваться от этого класса.
 */
export abstract class BaseApiService<T, CreateDto = Omit<T, 'id'>, UpdateDto = Partial<Omit<T, 'id'>>> 
  implements IBaseApiService<T, CreateDto, UpdateDto> {
  
  protected abstract endpoint: string;
  protected abstract mockData: T[];
  protected abstract getMockStorageKey(): string | undefined;
  
  constructor() {
    // При инициализации проверяем, есть ли мок-данные в localStorage
    this.loadMockData();
  }
  
  /**
   * Загружает мок-данные из localStorage или использует начальные данные
   */
  protected loadMockData(): T[] {
    const storageKey = this.getMockStorageKey();
    if (!storageKey) return this.mockData;
    
    try {
      const storedData = localStorage.getItem(storageKey);
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        if (Array.isArray(parsedData)) {
          this.mockData = parsedData;
          return parsedData;
        }
      }
    } catch (error) {
      console.error(`Ошибка при загрузке мок-данных для ${this.endpoint}:`, error);
    }
    
    // Если данных нет или произошла ошибка, используем начальные мок-данные
    // и сохраняем их в localStorage
    this.saveMockData(this.mockData);
    return this.mockData;
  }
  
  /**
   * Сохраняет мок-данные в localStorage
   */
  protected saveMockData(data: T[]): void {
    const storageKey = this.getMockStorageKey();
    if (!storageKey) return;
    
    try {
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      console.error(`Ошибка при сохранении мок-данных для ${this.endpoint}:`, error);
    }
  }
  
  /**
   * Получение токена авторизации из localStorage
   */
  protected getAuthToken(): string | undefined {
    const token = localStorage.getItem('authToken');
    return token || undefined;
  }
  
  /**
   * Выполнение запроса к реальному API
   */
  protected async request<R>(
    method: string,
    url: string,
    data?: any,
    requiresAuth: boolean = true
  ): Promise<R> {
    try {
      const headers = getHeaders(requiresAuth ? this.getAuthToken() : undefined);
      
      const config: RequestInit = {
        method,
        headers: headers as HeadersInit,
        body: data ? JSON.stringify(data) : undefined,
      };
      
      const response = await fetch(`${API_BASE_URL}${url}`, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw {
          status: response.status,
          message: errorData.message || `Ошибка ${response.status}: ${response.statusText}`,
          details: errorData.details || {}
        };
      }
      
      return await response.json();
    } catch (error) {
      return handleApiError(error);
    }
  }
  
  /**
   * Получение всех элементов
   */
  async getAll(): Promise<T[]> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока возвращаем данные из памяти
      return Promise.resolve([...this.mockData]);
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<T[]>('GET', `/${this.endpoint}`);
    }
  }
  
  /**
   * Получение элемента по ID
   */
  async getById(id: number): Promise<T> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока ищем элемент по ID
      const item = this.mockData.find(item => (item as any).id === id);
      
      if (!item) {
        throw {
          status: 404,
          message: `Элемент с ID ${id} не найден`,
          details: {}
        };
      }
      
      return Promise.resolve({...item});
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<T>('GET', `/${this.endpoint}/${id}`);
    }
  }
  
  /**
   * Создание нового элемента
   */
  async create(data: CreateDto): Promise<T> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока создаем новый элемент с уникальным ID
      const newId = this.mockData.length > 0 
        ? Math.max(...this.mockData.map(item => (item as any).id)) + 1
        : 1;
        
      const newItem = {
        id: newId,
        ...data
      } as unknown as T;
      
      // Добавляем в массив и сохраняем в localStorage
      this.mockData.push(newItem);
      this.saveMockData(this.mockData);
      
      return Promise.resolve({...newItem});
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<T>('POST', `/${this.endpoint}`, data);
    }
  }
  
  /**
   * Обновление элемента
   */
  async update(id: number, data: UpdateDto): Promise<T> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока ищем элемент по ID и обновляем его
      const index = this.mockData.findIndex(item => (item as any).id === id);
      
      if (index === -1) {
        throw {
          status: 404,
          message: `Элемент с ID ${id} не найден`,
          details: {}
        };
      }
      
      // Обновляем элемент, сохраняя его ID
      const updatedItem = {
        ...this.mockData[index],
        ...data
      } as T;
      
      this.mockData[index] = updatedItem;
      this.saveMockData(this.mockData);
      
      return Promise.resolve({...updatedItem});
    } else {
      // В реальном режиме делаем запрос к API
      return this.request<T>('PUT', `/${this.endpoint}/${id}`, data);
    }
  }
  
  /**
   * Удаление элемента
   */
  async delete(id: number): Promise<boolean> {
    if (API_CONFIG.mode === 'mock') {
      // В режиме мока ищем элемент по ID и удаляем его
      const index = this.mockData.findIndex(item => (item as any).id === id);
      
      if (index === -1) {
        throw {
          status: 404,
          message: `Элемент с ID ${id} не найден`,
          details: {}
        };
      }
      
      // Удаляем элемент из массива
      this.mockData.splice(index, 1);
      this.saveMockData(this.mockData);
      
      return Promise.resolve(true);
    } else {
      // В реальном режиме делаем запрос к API
      await this.request<void>('DELETE', `/${this.endpoint}/${id}`);
      return Promise.resolve(true);
    }
  }
} 