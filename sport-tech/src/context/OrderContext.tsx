import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { CartItem } from './CartContext';
import { orderService, isMockMode } from '../api';

// Интерфейс для контактной информации
export interface OrderContactInfo {
  phone: string;
  address: string;
  comment?: string;
  paymentMethod: 'cash' | 'card';
  userId?: number;
}

// Интерфейс для заказа
export interface Order {
  id: number;
  items: CartItem[];
  totalAmount: number;
  contactInfo: OrderContactInfo;
  status: 'new' | 'processing' | 'delivered' | 'completed' | 'cancelled';
  rentalStartDate: string;
  createdAt: string;
}

// Интерфейс для элемента заказа (для совместимости с API)
export interface OrderItem extends CartItem {}

// Интерфейс контекста заказов
interface OrderContextType {
  orders: Order[];
  getAllOrders: () => Order[];
  getUserOrders: (userId: number) => Order[];
  createOrder: (orderData: Omit<Order, 'id'>) => Promise<Order>;
  updateOrderStatus: (orderId: number, newStatus: Order['status']) => Promise<boolean>;
  getOrderById: (orderId: number) => Order | undefined;
  resetOrdersToMock: () => void;
}

// Создаем контекст
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Ключ для localStorage
const ORDERS_STORAGE_KEY = 'sport_tech_orders';

// Мок-данные для заказов
const mockOrders: Order[] = [
  {
    id: 1,
    items: [
      {
        id: 1,
        product: {
          id: 1,
          name: 'Беговая дорожка NordicTrack X32i',
          description: 'Профессиональная беговая дорожка с большим экраном',
          price: 550,
          image: 'https://example.com/treadmill.jpg',
          categoryId: 1
        },
        quantity: 1,
        days: 14
      }
    ],
    totalAmount: 7700,
    contactInfo: {
      phone: '+7 (999) 123-45-67',
      address: 'г. Москва, ул. Ленина, д. 10, кв. 25',
      paymentMethod: 'cash',
      userId: 1
    },
    status: 'new',
    rentalStartDate: '2023-05-20T10:00:00.000Z',
    createdAt: '2023-05-18T15:30:00.000Z'
  }
];

// Пропсы для провайдера
interface OrderProviderProps {
  children: ReactNode;
}

// Провайдер контекста заказов
export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const { auth } = useAuth();

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (isMockMode()) {
          // В режиме мока используем локальные данные как и раньше
          const loadedOrders = loadOrdersFromStorage();
          setOrders(loadedOrders);
          
          // Синхронизируем данные с API сервисом
          orderService.syncOrdersWithContext();
        } else {
          // В режиме реального API загружаем данные с сервера
          const allOrders = await orderService.getAll();
          setOrders(allOrders);
        }
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        // В случае ошибки используем мок-данные
        const loadedOrders = loadOrdersFromStorage();
        setOrders(loadedOrders);
      }
    };

    fetchOrders();
  }, []);

  // Получение всех заказов
  const getAllOrders = (): Order[] => {
    // Обязательно возвращаем полную копию массива orders,
    // чтобы избежать проблем с мутацией данных
    return [...orders];
  };

  // Получение заказов пользователя по ID
  const getUserOrders = (userId: number): Order[] => {
    if (!userId) return [];
    
    return orders.filter(order => 
      order.contactInfo && 
      typeof order.contactInfo.userId === 'number' && 
      order.contactInfo.userId === userId
    );
  };

  // Получение заказа по ID
  const getOrderById = (orderId: number): Order | undefined => {
    return orders.find(order => order.id === orderId);
  };

  // Функция для создания нового заказа
  const createOrder = async (orderData: Omit<Order, 'id'>): Promise<Order> => {
    try {
      // Проверяем, авторизован ли пользователь и добавляем его ID в контактную информацию
      const contactInfo = {
        ...orderData.contactInfo,
        userId: auth.isAuthenticated && auth.user ? auth.user.id : undefined
      };
      
      // Обновленные данные заказа
      const updatedOrderData = {
        ...orderData,
        contactInfo
      };
      
      // Создание нового заказа через API сервис
      const newOrder = await orderService.create(updatedOrderData as any);
      
      // Обновляем локальное состояние
      setOrders(prev => {
        const updated = [...prev, newOrder];
        // Сохраняем в основной localStorage для админки
        try {
          const adminOrdersRaw = localStorage.getItem('sport_tech_orders_v2');
          let adminOrders = [];
          if (adminOrdersRaw) {
            adminOrders = JSON.parse(adminOrdersRaw);
          }
          adminOrders.push({
            id: newOrder.id,
            userId: contactInfo.userId || 0,
            items: newOrder.items.map(item => ({
              id: item.product.id,
              name: item.product.name,
              quantity: item.quantity,
              price: item.product.price
            })),
            totalAmount: newOrder.totalAmount,
            status: newOrder.status || 'active',
            rentalDays: newOrder.items?.[0]?.days || 1,
            returnDate: '',
            contactInfo: contactInfo,
            createdAt: newOrder.createdAt
          });
          localStorage.setItem('sport_tech_orders_v2', JSON.stringify(adminOrders));
        } catch (e) {
          console.error('Ошибка при синхронизации заказа с админкой:', e);
        }
        return updated;
      });
      
      return newOrder;
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
      throw error;
    }
  };

  // Функция для обновления статуса заказа
  const updateOrderStatus = async (orderId: number, newStatus: Order['status']): Promise<boolean> => {
    try {
      // Обновляем статус через API сервис
      const success = await orderService.updateOrderStatus(orderId, newStatus);
      
      if (success) {
        // Обновляем локальное состояние
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, status: newStatus } 
              : order
          )
        );
      }
      
      return success;
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      return false;
    }
  };

  // Метод для сброса заказов к начальным данным
  const resetOrdersToMock = (): void => {
    try {
      // Очищаем локальное хранилище
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      // Сохраняем мок-данные
      saveOrdersToStorage(mockOrders);
      // Обновляем состояние
      setOrders(mockOrders);
      
      // Синхронизируем с API сервисом
      orderService.syncOrdersWithContext();
      
      console.log('Заказы успешно сброшены к начальным данным');
    } catch (error) {
      console.error('Ошибка при сбросе заказов к начальным данным:', error);
    }
  };

  // Значение контекста
  const value: OrderContextType = {
    orders,
    getAllOrders,
    getUserOrders,
    createOrder,
    updateOrderStatus,
    getOrderById,
    resetOrdersToMock
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Загрузка заказов из localStorage или использование начальных данных
const loadOrdersFromStorage = (): Order[] => {
  try {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (storedOrders) {
      const parsedOrders = JSON.parse(storedOrders);
      // Проверяем, что parsedOrders - это массив и он не пустой
      if (Array.isArray(parsedOrders) && parsedOrders.length > 0) {
        console.log('Загружены заказы из localStorage:', parsedOrders);
        return parsedOrders;
      }
    }
  } catch (error) {
    console.error('Ошибка при загрузке заказов из localStorage:', error);
  }
  
  // Если заказов нет или возникла ошибка, используем мок-данные
  console.log('Используются мок-данные для заказов:', mockOrders);
  // Сохраняем начальные заказы в localStorage при первом запуске
  saveOrdersToStorage(mockOrders);
  return mockOrders;
};

// Сохранение заказов в localStorage
const saveOrdersToStorage = (orders: Order[]): void => {
  try {
    const ordersJson = JSON.stringify(orders);
    localStorage.setItem(ORDERS_STORAGE_KEY, ordersJson);
    console.log('Заказы успешно сохранены в localStorage:', orders);
  } catch (error) {
    console.error('Ошибка при сохранении заказов в localStorage:', error);
    // Попытка очистить хранилище и сохранить повторно, если возникла ошибка
    try {
      localStorage.removeItem(ORDERS_STORAGE_KEY);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([]));
      console.warn('Хранилище заказов было очищено и установлено по умолчанию');
    } catch (clearError) {
      console.error('Невозможно очистить хранилище заказов:', clearError);
    }
  }
};

// Хук для использования контекста заказов
export const useOrder = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
}; 