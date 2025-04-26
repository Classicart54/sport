import { createContext, ReactNode, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/interfaces';

interface AuthContextProps {
  auth: AuthState;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'> & { password: string }) => Promise<boolean>;
  updateProfile: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeModal: () => void;
  isLoginModalOpen: boolean;
  isRegisterModalOpen: boolean;
  getAllUsers: () => User[];
}

export const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Имитация базы данных пользователей
const mockUsers: (User & { password: string })[] = [
  {
    id: 1,
    firstName: 'Иван',
    lastName: 'Петров',
    email: 'ivan@example.com',
    password: 'password123',
    phone: '+7 (999) 123-45-67',
    city: 'Москва',
    isAdmin: false
  },
  {
    id: 2,
    firstName: 'Админ',
    lastName: 'Администраторов',
    email: 'admin@sporttech.ru',
    password: 'admin',
    phone: '+7 (999) 999-99-99',
    city: 'Москва',
    isAdmin: true
  }
];

// Функция для загрузки пользователей из localStorage
const loadUsersFromStorage = (): (User & { password: string })[] => {
  try {
    const storedUsers = localStorage.getItem('mockUsers');
    if (storedUsers) {
      return JSON.parse(storedUsers);
    }
  } catch (error) {
    console.error('Ошибка при загрузке пользователей из localStorage:', error);
  }
  return mockUsers;
};

// Функция для сохранения пользователей в localStorage
const saveUsersToStorage = (users: (User & { password: string })[]) => {
  try {
    localStorage.setItem('mockUsers', JSON.stringify(users));
  } catch (error) {
    console.error('Ошибка при сохранении пользователей в localStorage:', error);
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState<AuthState>({
    user: null,
    isAuthenticated: false
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [users, setUsers] = useState<(User & { password: string })[]>(loadUsersFromStorage());

  // Инициализация localStorage при первом запуске
  useEffect(() => {
    if (!localStorage.getItem('mockUsers')) {
      saveUsersToStorage(mockUsers);
    }
  }, []);

  // Проверка сохраненного пользователя при загрузке
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        setAuth({
          user,
          isAuthenticated: true
        });
      } catch (error) {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Имитация запроса к API
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUsers = loadUsersFromStorage();
        const user = currentUsers.find(
          (u) => u.email === email && u.password === password
        );

        if (user) {
          const { password, ...userWithoutPassword } = user;
          setAuth({
            user: userWithoutPassword,
            isAuthenticated: true
          });
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          resolve(true);
        } else {
          resolve(false);
        }
      }, 500);
    });
  };

  const register = async (userData: Omit<User, 'id'> & { password: string }): Promise<boolean> => {
    // Имитация запроса к API
    return new Promise((resolve) => {
      setTimeout(() => {
        const currentUsers = loadUsersFromStorage();
        
        // Проверяем, существует ли пользователь с таким email
        const existingUser = currentUsers.find((u) => u.email === userData.email);
        
        if (existingUser) {
          resolve(false);
          return;
        }

        // Создаем нового пользователя
        const newUser = {
          ...userData,
          id: currentUsers.length + 1
        };

        // Добавляем в массив и сохраняем в localStorage
        const updatedUsers = [...currentUsers, newUser];
        setUsers(updatedUsers);
        saveUsersToStorage(updatedUsers);

        // Сохраняем пользователя без пароля в состояние
        const { password, ...userWithoutPassword } = newUser;
        setAuth({
          user: userWithoutPassword,
          isAuthenticated: true
        });
        localStorage.setItem('user', JSON.stringify(userWithoutPassword));
        resolve(true);
      }, 500);
    });
  };

  const updateProfile = async (userData: Omit<User, 'id'>): Promise<boolean> => {
    // Имитация запроса к API
    return new Promise((resolve) => {
      setTimeout(() => {
        try {
          console.log('------- DEBUG: updateProfile -------');
          console.log('userData получен:', userData);
          
          // Проверяем, авторизован ли пользователь
          if (!auth.isAuthenticated || !auth.user) {
            console.error('Пользователь не авторизован');
            resolve(false);
            return;
          }

          const currentUsers = loadUsersFromStorage();
          console.log('Текущие пользователи в базе:', currentUsers);

          // Находим пользователя в моке
          const userIndex = currentUsers.findIndex((u) => u.id === auth.user!.id);
          console.log('Индекс пользователя в базе:', userIndex);
          
          // Обновленный массив пользователей
          let updatedUsers = [...currentUsers];
          
          if (userIndex === -1) {
            console.log('Пользователь не найден в базе. Создаем новую запись...');
            
            // Если пользователь не найден в моке (например, восстановлен из localStorage),
            // создаем новую запись
            const newUser = {
              ...userData,
              id: auth.user.id,
              password: 'password123' // Используем дефолтный пароль
            };
            
            console.log('Новый пользователь:', newUser);
            updatedUsers.push(newUser);
          } else {
            console.log('Пользователь найден в базе. Обновляем запись...');
            
            // Сохраняем пароль пользователя
            const password = currentUsers[userIndex].password;
            console.log('Сохранен пароль:', password);

            // Обновляем данные в моке
            const updatedUser = {
              ...userData,
              id: auth.user.id,
              password
            };
            
            console.log('Обновленный пользователь:', updatedUser);
            updatedUsers[userIndex] = updatedUser;
          }

          // Обновляем данные в localStorage
          setUsers(updatedUsers);
          saveUsersToStorage(updatedUsers);

          // Обновляем данные в контексте и localStorage
          const userWithoutPassword = {
            ...userData,
            id: auth.user.id
          };
          
          console.log('Данные для контекста:', userWithoutPassword);
          
          // Устанавливаем данные в контекст авторизации
          setAuth({
            user: userWithoutPassword,
            isAuthenticated: true
          });
          
          // Сохраняем в localStorage
          localStorage.setItem('user', JSON.stringify(userWithoutPassword));
          
          console.log('Обновленная база данных:', updatedUsers);
          console.log('------- END DEBUG: updateProfile -------');
          
          resolve(true);
        } catch (error) {
          console.error('Ошибка при обновлении профиля:', error);
          resolve(false);
        }
      }, 500);
    });
  };

  const logout = () => {
    setAuth({
      user: null,
      isAuthenticated: false
    });
    localStorage.removeItem('user');
  };

  const openLoginModal = () => {
    setIsLoginModalOpen(true);
    setIsRegisterModalOpen(false);
  };

  const openRegisterModal = () => {
    setIsRegisterModalOpen(true);
    setIsLoginModalOpen(false);
  };

  const closeModal = () => {
    setIsLoginModalOpen(false);
    setIsRegisterModalOpen(false);
  };

  // Получение всех пользователей (без паролей)
  const getAllUsers = (): User[] => {
    const currentUsers = loadUsersFromStorage();
    return currentUsers.map(({ password, ...userWithoutPassword }) => userWithoutPassword);
  };

  const contextValue: AuthContextProps = {
    auth,
    login,
    register,
    updateProfile,
    logout,
    openLoginModal,
    openRegisterModal,
    closeModal,
    isLoginModalOpen,
    isRegisterModalOpen,
    getAllUsers
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 