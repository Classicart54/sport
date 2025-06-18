import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from './AuthContext';

// Интерфейс для элемента заказа
export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  price: number;
}

// Интерфейс для контактной информации в заказе
export interface OrderContactInfo {
  fullName: string;
  phone: string;
  address: string;
  postalCode: string;
  paymentMethod: 'cash' | 'card';
}

// Интерфейс для заказа
export interface OrderData {
  id: number;
  userId: number;
  items: OrderItem[];
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  rentalDays: number;
  returnDate: string;
  contactInfo?: OrderContactInfo;
  createdAt: string;
}

// Интерфейс контекста заказов
interface OrdersContextType {
  orders: OrderData[];
  userOrders: OrderData[];
  addOrder: (orderData: Omit<OrderData, 'id' | 'createdAt'>) => OrderData;
  getOrdersByUserId: (userId: number) => OrderData[];
  getAllOrders: () => OrderData[];
  updateOrderStatus: (orderId: number, status: OrderData['status']) => boolean;
  deleteOrder: (orderId: number) => boolean;
}

// Ключ для localStorage
const ORDERS_KEY = 'sport_tech_orders_v2';

// Создаем контекст
const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

// Провайдер контекста заказов
export const OrdersProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const { auth } = useAuth();

  // Загрузка заказов при монтировании
  useEffect(() => {
    const storedOrders = localStorage.getItem(ORDERS_KEY);
    if (storedOrders) {
      try {
        setOrders(JSON.parse(storedOrders));
      } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
        setOrders([]);
      }
    }
  }, []);

  // Сохранение заказов в localStorage при изменении
  useEffect(() => {
    if (orders.length > 0) {
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    }
  }, [orders]);

  // Получение заказов конкретного пользователя
  const getOrdersByUserId = (userId: number): OrderData[] => {
    return orders.filter(order => order.userId === userId);
  };

  // Получение всех заказов пользователя
  const userOrders = auth.isAuthenticated && auth.user 
    ? getOrdersByUserId(auth.user.id) 
    : [];

  // Получение всех заказов для администратора
  const getAllOrders = (): OrderData[] => {
    return orders;
  };

  // Добавление нового заказа
  const addOrder = (orderData: Omit<OrderData, 'id' | 'createdAt'>): OrderData => {
    const newOrder: OrderData = {
      ...orderData,
      id: Date.now(),
      createdAt: new Date().toISOString()
    };

    setOrders(prevOrders => [...prevOrders, newOrder]);
    return newOrder;
  };

  // Обновление статуса заказа
  const updateOrderStatus = (orderId: number, newStatus: OrderData['status']): boolean => {
    try {
      const ordersRaw = localStorage.getItem('sport_tech_orders_v2');
      if (!ordersRaw) return false;
      
      const orders = JSON.parse(ordersRaw);
      const orderIndex = orders.findIndex((order: OrderData) => order.id === orderId);
      
      if (orderIndex === -1) return false;
      
      orders[orderIndex].status = newStatus;
      localStorage.setItem('sport_tech_orders_v2', JSON.stringify(orders));
      setOrders(orders);
      
      return true;
    } catch (error) {
      console.error('Ошибка при обновлении статуса заказа:', error);
      return false;
    }
  };

  const deleteOrder = (orderId: number): boolean => {
    try {
      const ordersRaw = localStorage.getItem('sport_tech_orders_v2');
      if (!ordersRaw) return false;
      
      const orders = JSON.parse(ordersRaw);
      const updatedOrders = orders.filter((order: OrderData) => order.id !== orderId);
      
      if (updatedOrders.length === orders.length) return false;
      
      localStorage.setItem('sport_tech_orders_v2', JSON.stringify(updatedOrders));
      setOrders(updatedOrders);
      
      return true;
    } catch (error) {
      console.error('Ошибка при удалении заказа:', error);
      return false;
    }
  };

  // Значение контекста
  const value: OrdersContextType = {
    orders,
    userOrders,
    addOrder,
    getOrdersByUserId,
    getAllOrders,
    updateOrderStatus,
    deleteOrder
  };

  return (
    <OrdersContext.Provider value={value}>
      {children}
    </OrdersContext.Provider>
  );
};

// Хук для использования контекста заказов
export const useOrders = (): OrdersContextType => {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}; 