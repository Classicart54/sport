import { BaseApiService } from './baseApiService';
import { 
  AuthApiService as IAuthApiService, 
  AuthResponse, 
  UserRegisterDto,
  UserLoginDto
} from '../interfaces/apiInterfaces';
import { User } from '../../types/interfaces';
import { API_CONFIG } from '../config/apiConfig';
import { mockUsers } from '../../data/mockData';

// Расширенный тип для мок-пользователей с паролем
interface MockUser extends User {
  password: string;
}

/**
 * Сервис для работы с аутентификацией и пользователями
 */
export class AuthApiService extends BaseApiService<User> implements IAuthApiService {
  protected endpoint = 'users';
  protected mockData: User[] = [];
  
  constructor() {
    super();
    try {
      // При инициализации загружаем пользователей из localStorage
      // или используем мок-данные, если в localStorage ничего нет
      const storedUsers = localStorage.getItem(this.getMockStorageKey());
      if (storedUsers) {
        this.mockData = JSON.parse(storedUsers);
      } else if (Array.isArray(mockUsers) && mockUsers.length > 0) {
        // Используем мок-данные из импорта
        this.mockData = [...mockUsers];
        this.saveMockData(this.mockData);
      }
    } catch (error) {
      console.error('Ошибка при инициализации пользовательских данных:', error);
    }
  }
  
  protected getMockStorageKey(): string {
    return 'mockUsers';
  }
  
  /**
   * Регистрация нового пользователя
   * @param userData Данные пользователя
   */
  async register(userData: UserRegisterDto): Promise<AuthResponse> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData() as MockUser[];
        const existingUser = users.find(user => user.email === userData.email);
        
        if (existingUser) {
          return Promise.reject({ message: 'Пользователь с таким email уже существует' });
        }
        
        const newUser: MockUser = {
          id: users.length ? Math.max(...users.map(user => user.id)) + 1 : 1,
          firstName: userData.firstName,
          lastName: userData.lastName,
          email: userData.email,
          password: userData.password,
          phone: userData.phone || '',
          city: userData.city || '',
          avatar: undefined,
          isAdmin: false
        };
        
        this.mockData = [...users, newUser];
        this.saveMockData(this.mockData);
        
        const token = `mock-token-${newUser.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        
        // Возвращаем пользователя без пароля
        const { password, ...userWithoutPassword } = newUser;
        
        return Promise.resolve({
          user: userWithoutPassword,
          token
        });
      } catch (error) {
        console.error('Ошибка при регистрации:', error);
        return Promise.reject({ message: 'Ошибка при регистрации пользователя' });
      }
    } else {
      return this.request<AuthResponse>('POST', '/auth/register', userData);
    }
  }
  
  /**
   * Вход пользователя
   * @param credentials Учетные данные
   */
  async login(credentials: UserLoginDto): Promise<AuthResponse> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData() as MockUser[];
        const user = users.find(
          user => user.email === credentials.email && (user as MockUser).password === credentials.password
        );
        
        if (!user) {
          return Promise.reject({ message: 'Неверный email или пароль' });
        }
        
        const token = `mock-token-${user.id}-${Date.now()}`;
        localStorage.setItem('authToken', token);
        
        // Возвращаем пользователя без пароля
        const { password, ...userWithoutPassword } = user as MockUser;
        
        return Promise.resolve({
          user: userWithoutPassword,
          token
        });
      } catch (error) {
        console.error('Ошибка при входе:', error);
        return Promise.reject({ message: 'Ошибка при входе в систему' });
      }
    } else {
      return this.request<AuthResponse>('POST', '/auth/login', credentials);
    }
  }
  
  /**
   * Выход пользователя
   */
  async logout(): Promise<boolean> {
    if (API_CONFIG.mode === 'mock') {
      localStorage.removeItem('authToken');
      return Promise.resolve(true);
    } else {
      return this.request<boolean>('POST', '/auth/logout');
    }
  }
  
  /**
   * Проверка токена аутентификации
   */
  async validateToken(): Promise<User> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const token = localStorage.getItem('authToken');
        if (!token) {
          return Promise.reject({ message: 'Пользователь не авторизован' });
        }
        
        const tokenParts = token.split('-');
        if (tokenParts.length < 2) {
          return Promise.reject({ message: 'Некорректный токен' });
        }
        
        const userId = parseInt(tokenParts[1]);
        const users = this.loadMockData();
        const user = users.find(user => user.id === userId);
        
        if (!user) {
          return Promise.reject({ message: 'Пользователь не найден' });
        }
        
        return Promise.resolve(user);
      } catch (error) {
        console.error('Ошибка при валидации токена:', error);
        return Promise.reject({ message: 'Ошибка при проверке авторизации' });
      }
    } else {
      return this.request<User>('GET', '/auth/me');
    }
  }
  
  /**
   * Обновление профиля пользователя
   * @param userData Данные пользователя
   */
  async updateProfile(userData: Partial<User>): Promise<User> {
    if (API_CONFIG.mode === 'mock') {
      try {
        if (!userData.id) {
          return Promise.reject({ message: 'ID пользователя не указан' });
        }
        
        const users = this.loadMockData();
        const userIndex = users.findIndex(user => user.id === userData.id);
        
        if (userIndex === -1) {
          return Promise.reject({ message: 'Пользователь не найден' });
        }
        
        const updatedUser = {
          ...users[userIndex],
          ...userData
        };
        
        users[userIndex] = updatedUser;
        this.mockData = users;
        this.saveMockData(this.mockData);
        
        return Promise.resolve(updatedUser);
      } catch (error) {
        console.error('Ошибка при обновлении профиля:', error);
        return Promise.reject({ message: 'Ошибка при обновлении профиля' });
      }
    } else {
      return this.request<User>('PUT', `/${this.endpoint}/${userData.id}`, userData);
    }
  }
  
  /**
   * Получение списка всех пользователей (только для администратора)
   */
  async getAllUsers(): Promise<User[]> {
    if (API_CONFIG.mode === 'mock') {
      try {
        const users = this.loadMockData();
        // Копируем пользователей, чтобы избежать мутации исходных данных
        return Promise.resolve([...users]);
      } catch (error) {
        console.error('Ошибка при получении пользователей:', error);
        return Promise.reject({ message: 'Ошибка при получении списка пользователей' });
      }
    } else {
      return this.request<User[]>('GET', `/${this.endpoint}`);
    }
  }
} 