import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Интерфейс для элемента заказа
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// Интерфейс для заказа
export interface Order {
  id: number;
  date: string;
  items: OrderItem[];
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  rentalDays: number;
  returnDate: string;
  userId: number;
}

// Интерфейс контекста заказов
interface OrderContextType {
  orders: Order[];
  getUserOrders: (userId: number) => Order[];
  addOrder: (newOrder: Omit<Order, 'id' | 'date'>) => Order;
  updateOrderStatus: (orderId: number, newStatus: 'active' | 'completed' | 'cancelled') => boolean;
}

// Ключ для localStorage
const ORDERS_STORAGE_KEY = 'sport_tech_orders';

// Мок-данные для заказов с привязкой к пользователям
const mockOrders: Order[] = [
  {
    id: 1,
    date: '20.05.2023',
    items: [
      { id: 1, name: 'Беговая дорожка NordicTrack X32i', quantity: 1, price: 550 },
      { id: 2, name: 'Набор гантелей Reebok 10кг', quantity: 2, price: 120 }
    ],
    totalAmount: 790,
    status: 'active',
    rentalDays: 14,
    returnDate: '03.06.2023',
    userId: 1
  },
  {
    id: 2,
    date: '10.04.2023',
    items: [
      { id: 3, name: 'Эллиптический тренажер Precor EFX 885', quantity: 1, price: 780 }
    ],
    totalAmount: 780,
    status: 'completed',
    rentalDays: 7,
    returnDate: '17.04.2023',
    userId: 1
  },
  {
    id: 3,
    date: '05.03.2023',
    items: [
      { id: 4, name: 'Велотренажер Schwinn IC7', quantity: 1, price: 320 },
      { id: 5, name: 'Коврик для йоги Manduka', quantity: 1, price: 50 }
    ],
    totalAmount: 370,
    status: 'cancelled',
    rentalDays: 30,
    returnDate: '04.04.2023',
    userId: 2
  }
];

// Создаем контекст
const OrderContext = createContext<OrderContextType | undefined>(undefined);

// Пропсы для провайдера
interface OrderProviderProps {
  children: ReactNode;
}

// Провайдер контекста заказов
export const OrderProvider: React.FC<OrderProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);

  // Загрузка заказов при монтировании компонента
  useEffect(() => {
    const loadedOrders = loadOrdersFromStorage();
    setOrders(loadedOrders);
  }, []);

  // Получение заказов пользователя по ID
  const getUserOrders = (userId: number): Order[] => {
    return orders.filter(order => order.userId === userId);
  };

  // Функция для добавления нового заказа
  const addOrder = (newOrderData: Omit<Order, 'id' | 'date'>): Order => {
    // Генерация ID для нового заказа
    const newOrderId = orders.length > 0 ? Math.max(...orders.map(order => order.id)) + 1 : 1;
    
    // Формирование текущей даты в формате дд.мм.гггг
    const today = new Date();
    const formattedDate = `${today.getDate().toString().padStart(2, '0')}.${(today.getMonth() + 1).toString().padStart(2, '0')}.${today.getFullYear()}`;
    
    // Расчет даты возврата
    const returnDate = new Date(today);
    returnDate.setDate(returnDate.getDate() + parseInt(newOrderData.rentalDays.toString()));
    const formattedReturnDate = `${returnDate.getDate().toString().padStart(2, '0')}.${(returnDate.getMonth() + 1).toString().padStart(2, '0')}.${returnDate.getFullYear()}`;
    
    // Создание нового заказа с деструктуризацией данных заказа, исключая returnDate из newOrderData
    const { returnDate: _, ...orderDataWithoutReturnDate } = newOrderData;
    const newOrder: Order = {
      id: newOrderId,
      date: formattedDate,
      returnDate: formattedReturnDate,
      ...orderDataWithoutReturnDate
    };
    
    // Добавление заказа в состояние и сохранение в localStorage
    const updatedOrders = [...orders, newOrder];
    setOrders(updatedOrders);
    saveOrdersToStorage(updatedOrders);
    
    return newOrder;
  };

  // Функция для обновления статуса заказа
  const updateOrderStatus = (orderId: number, newStatus: 'active' | 'completed' | 'cancelled'): boolean => {
    try {
      const updatedOrders = [...orders];
      const orderIndex = updatedOrders.findIndex(order => order.id === orderId);
      
      if (orderIndex === -1) {
        return false;
      }
      
      updatedOrders[orderIndex].status = newStatus;
      setOrders(updatedOrders);
      saveOrdersToStorage(updatedOrders);
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      return false;
    }
  };

  // Значение контекста
  const value: OrderContextType = {
    orders,
    getUserOrders,
    addOrder,
    updateOrderStatus
  };

  return <OrderContext.Provider value={value}>{children}</OrderContext.Provider>;
};

// Загрузка заказов из localStorage или использование начальных данных
export const loadOrdersFromStorage = (): Order[] => {
  try {
    const storedOrders = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (storedOrders) {
      return JSON.parse(storedOrders);
    }
  } catch (error) {
    console.error('Ошибка при загрузке заказов из localStorage:', error);
  }
  
  // Сохраняем начальные заказы в localStorage при первом запуске
  saveOrdersToStorage(mockOrders);
  return mockOrders;
};

// Сохранение заказов в localStorage
export const saveOrdersToStorage = (orders: Order[]): void => {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch (error) {
    console.error('Ошибка при сохранении заказов в localStorage:', error);
  }
};

// Хук для использования контекста заказов
export const useOrders = (): OrderContextType => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
}; 