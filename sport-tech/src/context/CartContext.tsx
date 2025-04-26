import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/interfaces';
import { useAuth } from './AuthContext';

// Тип элемента корзины
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
}

// Тип состояния корзины
interface CartState {
  items: CartItem[];
  subtotal: number;
}

// Интерфейс контекста корзины
interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
  isCartNotificationOpen: boolean;
  cartNotificationProduct: string;
  closeCartNotification: () => void;
}

// Создаем контекст
const CartContext = createContext<CartContextType | undefined>(undefined);

// Пропсы для провайдера
interface CartProviderProps {
  children: ReactNode;
}

// Провайдер контекста корзины
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { auth } = useAuth();
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [cartNotificationProduct, setCartNotificationProduct] = useState('');
  
  // Формируем ключ для localStorage на основе ID пользователя или используем дефолтный ключ
  const storageKey = auth.isAuthenticated && auth.user ? `cart_${auth.user.id}` : 'cart_guest';

  // Инициализируем состояние корзины из localStorage или создаем пустую корзину
  const [cart, setCart] = useState<CartState>(() => {
    const savedCart = localStorage.getItem(storageKey);
    return savedCart ? JSON.parse(savedCart) : { items: [], subtotal: 0 };
  });

  // При изменении пользователя загружаем его корзину
  useEffect(() => {
    const savedCart = localStorage.getItem(storageKey);
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    } else {
      setCart({ items: [], subtotal: 0 });
    }
  }, [storageKey]);

  // Обновляем localStorage при изменении корзины
  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(cart));
  }, [cart, storageKey]);

  // Закрытие уведомления о добавлении в корзину
  const closeCartNotification = () => {
    setIsCartNotificationOpen(false);
  };

  // Рассчитываем общую стоимость корзины
  const calculateSubtotal = (items: CartItem[]): number => {
    return items.reduce((total, item) => {
      return total + (item.product.price * item.quantity);
    }, 0);
  };

  // Добавление товара в корзину
  const addToCart = (product: Product, quantity: number = 1) => {
    setCart(prevCart => {
      const existingItemIndex = prevCart.items.findIndex(
        item => item.product.id === product.id
      );

      let updatedItems: CartItem[];

      if (existingItemIndex >= 0) {
        // Если товар уже есть в корзине, увеличиваем количество
        updatedItems = [...prevCart.items];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity
        };
      } else {
        // Если товара нет в корзине, добавляем новый элемент
        updatedItems = [
          ...prevCart.items,
          {
            id: Date.now(), // Генерируем уникальный id для элемента корзины
            product,
            quantity
          }
        ];
      }

      // Показываем уведомление
      setCartNotificationProduct(product.name);
      setIsCartNotificationOpen(true);

      // Обновляем корзину с новым subtotal
      return {
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
  };

  // Удаление товара из корзины
  const removeFromCart = (itemId: number) => {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== itemId);
      return {
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
  };

  // Обновление количества товара
  const updateQuantity = (itemId: number, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCart(prevCart => {
      const updatedItems = prevCart.items.map(item => {
        if (item.id === itemId) {
          return { ...item, quantity };
        }
        return item;
      });

      return {
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
  };

  // Очистка корзины
  const clearCart = () => {
    setCart({ items: [], subtotal: 0 });
  };

  // Значение контекста
  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    subtotal: cart.subtotal,
    isCartNotificationOpen,
    cartNotificationProduct,
    closeCartNotification
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

// Хук для использования контекста корзины
export const useCart = (): CartContextType => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}; 