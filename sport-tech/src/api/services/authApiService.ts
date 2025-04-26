import { BaseApiService } from './baseApiService';
import { AuthApiService as IAuthApiService, AuthResponse, ProfileUpdateData } from '../interfaces/apiInterfaces';
import { User } from '../../types/interfaces';
import { API_CONFIG } from '../config/apiConfig';
import { mockUsers } from '../../data/mockData';

/**
 * Сервис для работы с аутентификацией и пользователями
 */
export class AuthApiService extends BaseApiService<User> implements IAuthApiService {
  protected endpoint = 'users';
  protected mockData: User[] = [...mockUsers];
  
  protected getMockStorageKey(): string {
    return 'mockUsers';
  }
  
  /**
   * Регистрация нового пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   * @param name Имя пользователя
   */
  async register(email: string, password: string, name: string): Promise<AuthResponse> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData();
        const existingUser = users.find(user => user.email === email);
        
        if (existingUser) {
          return Promise.reject({ message: 'Пользователь с таким email уже существует' });
        }
        
        const newUser: User = {
          id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
          email,
          name,
          password, // В реальном приложении пароль должен быть захеширован
          role: 'user',
          phone: '',
          city: '',
          avatar: null,
        };
        
        this.mockData = [...users, newUser];
        this.saveMockData();
        
        const token = `mock-token-${newUser.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        
        return Promise.resolve({
          user: { ...newUser, password: undefined } as User,
          token
        });
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        return Promise.reject({ message: 'Ошибка при регистрации пользователя' });
      }
    } else {
      return this.request<AuthResponse>('POST', '/auth/register', { email, password, name });
    }
  }
  
  /**
   * Вход пользователя
   * @param email Email пользователя
   * @param password Пароль пользователя
   */
  async login(email: string, password: string): Promise<AuthResponse> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData();
        const user = users.find(user => user.email === email && user.password === password);
        
        if (!user) {
          return Promise.reject({ message: 'Неверный email или пароль' });
        }
        
        const token = `mock-token-${user.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        
        return Promise.resolve({
          user: { ...user, password: undefined } as User,
          token
        });
      } catch (error) {
        console.error('Ошибка при входе:', error);
        return Promise.reject({ message: 'Ошибка при входе в систему' });
      }
    } else {
      return this.request<AuthResponse>('POST', '/auth/login', { email, password });
    }
  }
  
  /**
   * Выход пользователя
   */
  async logout(): Promise<void> {
    if (API_CONFIG.mode === 'mock') {
      localStorage.removeItem('authToken');
      return Promise.resolve();
    } else {
      return this.request<void>('POST', '/auth/logout');
    }
  }
  
  /**
   * Получение текущего пользователя по токену
   */
  async getCurrentUser(): Promise<User> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          return Promise.reject({ message: 'Пользователь не авторизован' });
        }
        
        const userId = parseInt(token.split('-')[1]);
        const users = this.loadMockData();
        const user = users.find(user => user.id === userId);
        
        if (!user) {
          return Promise.reject({ message: 'Пользователь не найден' });
        }
        
        return Promise.resolve({ ...user, password: undefined } as User);
      } catch (error) {
        console.error('Ошибка при получении текущего пользователя:', error);
        return Promise.reject({ message: 'Ошибка при получении данных пользователя' });
      }
    } else {
      return this.request<User>('GET', '/auth/me');
    }
  }
  
  /**
   * Обновление профиля пользователя
   * @param userId ID пользователя
   * @param data Данные для обновления
   */
  async updateProfile(userId: number, data: ProfileUpdateData): Promise<User> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData();
        const userIndex = users.findIndex(user => user.id === userId);
        
        if (userIndex === -1) {
          return Promise.reject({ message: 'Пользователь не найден' });
        }
        
        const updatedUser = {
          ...users[userIndex],
          ...data
        };
        
        users[userIndex] = updatedUser;
        this.mockData = users;
        this.saveMockData();
        
        return Promise.resolve({ ...updatedUser, password: undefined } as User);
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        return Promise.reject({ message: 'Ошибка при обновлении профиля' });
      }
    } else {
      return this.request<User>('PUT', `/${this.endpoint}/${userId}`, data);
    }
  }
  
  /**
   * Получение всех пользователей (только для администратора)
   */
  async getAllUsers(): Promise<User[]> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData();
        return Promise.resolve(users.map(user => ({ ...user, password: undefined }) as User));
      } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        return Promise.reject({ message: 'Ошибка при получении списка пользователей' });
      }
    } else {
      return this.request<User[]>('GET', `/${this.endpoint}`);
    }
  }
} 