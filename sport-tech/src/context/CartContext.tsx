import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '../types/interfaces';
import { useAuth } from './AuthContext';

// Тип элемента корзины
export interface CartItem {
  id: number;
  product: Product;
  quantity: number;
  days: number;
}

// Тип состояния корзины
interface CartState {
  items: CartItem[];
  subtotal: number;
}

// Интерфейс контекста корзины
interface CartContextType {
  cart: CartState;
  addToCart: (product: Product, quantity?: number, days?: number) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, quantity: number) => void;
  updateDays: (itemId: number, days: number) => void;
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

// Функция для расчета общей стоимости корзины
// Вынесена отдельно, чтобы избежать проблем с hoisting
const calculateSubtotal = (items: CartItem[]): number => {
  if (!items || !Array.isArray(items)) return 0;
  
  return items.reduce((total, item) => {
    if (!item || !item.product) return total;
    const price = item.product.price || 0;
    const quantity = item.quantity || 1;
    const days = item.days || 1;
    return total + (price * quantity * days);
  }, 0);
};

// Очищаем сразу все данные корзины
try {
  localStorage.removeItem('cart_guest');
  // Также очищаем все ключи, начинающиеся с 'cart_'
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith('cart_')) {
      localStorage.removeItem(key);
    }
  });
} catch (e) {
  console.error('Ошибка при очистке корзины из localStorage:', e);
}

// Провайдер контекста корзины
export const CartProvider: React.FC<CartProviderProps> = ({ children }) => {
  const { auth } = useAuth();
  const [isCartNotificationOpen, setIsCartNotificationOpen] = useState(false);
  const [cartNotificationProduct, setCartNotificationProduct] = useState('');
  
  // Инициализируем пустую корзину
  const [cart, setCart] = useState<CartState>({ items: [], subtotal: 0 });
  
  // Формируем ключ для localStorage на основе ID пользователя или используем дефолтный ключ
  const storageKey = auth.isAuthenticated && auth.user ? `cart_${auth.user.id}` : 'cart_guest';

  // Закрытие уведомления о добавлении в корзину
  const closeCartNotification = () => {
    setIsCartNotificationOpen(false);
  };

  // Добавление товара в корзину
  const addToCart = (product: Product, quantity: number = 1, days: number = 1) => {
    try {
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
            quantity: updatedItems[existingItemIndex].quantity + quantity,
            days: days // обновляем срок аренды
        };
      } else {
        // Если товара нет в корзине, добавляем новый элемент
        updatedItems = [
          ...prevCart.items,
          {
            id: Date.now(), // Генерируем уникальный id для элемента корзины
            product,
              quantity,
              days
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
    } catch (error) {
      console.error('Ошибка при добавлении товара в корзину:', error);
    }
  };

  // Удаление товара из корзины
  const removeFromCart = (itemId: number) => {
    try {
    setCart(prevCart => {
      const updatedItems = prevCart.items.filter(item => item.id !== itemId);
      return {
        items: updatedItems,
        subtotal: calculateSubtotal(updatedItems)
      };
    });
    } catch (error) {
      console.error('Ошибка при удалении товара из корзины:', error);
    }
  };

  // Обновление количества товара
  const updateQuantity = (itemId: number, quantity: number) => {
    try {
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
    } catch (error) {
      console.error('Ошибка при обновлении количества товара:', error);
    }
  };

  // Обновление количества дней аренды
  const updateDays = (itemId: number, days: number) => {
    try {
      setCart(prevCart => {
        const updatedItems = prevCart.items.map(item => {
          if (item.id === itemId) {
            return { ...item, days };
          }
          return item;
        });
        return {
          items: updatedItems,
          subtotal: calculateSubtotal(updatedItems)
        };
      });
    } catch (error) {
      console.error('Ошибка при обновлении срока аренды:', error);
    }
  };

  // Очистка корзины
  const clearCart = () => {
    setCart({ items: [], subtotal: 0 });
  };

  // Сохраняем корзину в localStorage
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(cart));
    } catch (error) {
      console.error('Ошибка при сохранении корзины в localStorage:', error);
    }
  }, [cart, storageKey]);

  // Значение контекста
  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateQuantity,
    updateDays,
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