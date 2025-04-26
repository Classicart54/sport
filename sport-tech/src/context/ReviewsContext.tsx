import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Review } from '../types/interfaces';
import { useAuth } from './AuthContext';

// Имитация базы данных отзывов
const mockReviews: Review[] = [
  {
    id: 1,
    productId: 1,
    userId: 2,
    author: 'Анна М.',
    rating: 5,
    date: '15 мая 2023',
    text: 'Отличный тренажер! Использую уже месяц, очень довольна качеством. Бесшумный, компактный, прекрасно подходит для домашних тренировок.',
    avatar: 'https://randomuser.me/api/portraits/women/41.jpg'
  },
  {
    id: 2,
    productId: 1,
    userId: 3,
    author: 'Алексей К.',
    rating: 4,
    date: '3 апреля 2023',
    text: 'Хороший тренажер за свои деньги. Единственный минус - несколько сложная сборка, но со всем разобрался за час. В целом рекомендую!',
    avatar: 'https://randomuser.me/api/portraits/men/32.jpg'
  },
  {
    id: 3,
    productId: 1,
    userId: 4,
    author: 'Екатерина П.',
    rating: 5,
    date: '20 марта 2023',
    text: 'Очень удобно, что можно арендовать, а не покупать сразу. Тренажер в отличном состоянии, работает идеально. Буду продлевать аренду.',
    avatar: 'https://randomuser.me/api/portraits/women/63.jpg'
  },
  {
    id: 4,
    productId: 2,
    userId: 5,
    author: 'Иван С.',
    rating: 5,
    date: '10 июня 2023',
    text: 'Отличный велотренажер! Тихий, устойчивый, хорошо собран. Отдельно хочу отметить комфортное сиденье - можно заниматься долго и без дискомфорта.',
    avatar: 'https://randomuser.me/api/portraits/men/44.jpg'
  },
  {
    id: 5,
    productId: 3,
    userId: 6,
    author: 'Мария В.',
    rating: 4,
    date: '5 мая 2023',
    text: 'Степпер очень удобный, компактный. Занимает мало места, что важно для небольшой квартиры. Единственное - скрипит немного при интенсивных тренировках.',
    avatar: 'https://randomuser.me/api/portraits/women/22.jpg'
  }
];

// Ключ для хранения отзывов в localStorage
const REVIEWS_STORAGE_KEY = 'sport-tech-reviews';

// Функция для загрузки отзывов из localStorage
const loadReviewsFromStorage = (): Review[] => {
  try {
    const storedReviews = localStorage.getItem(REVIEWS_STORAGE_KEY);
    console.log('Пытаемся загрузить отзывы из localStorage. Данные присутствуют:', !!storedReviews);
    
    if (storedReviews) {
      const parsedReviews = JSON.parse(storedReviews);
      console.log('Загружены отзывы из localStorage:', parsedReviews);
      return Array.isArray(parsedReviews) ? parsedReviews : mockReviews;
    }
  } catch (error) {
    console.error('Ошибка при загрузке отзывов из localStorage:', error);
  }
  
  // Если в localStorage ничего нет или произошла ошибка, используем моковые данные
  console.log('Используются исходные моковые данные для отзывов');
  // Сохраняем моковые данные в localStorage при первом запуске
  saveReviewsToStorage(mockReviews);
  return mockReviews;
};

// Функция для сохранения отзывов в localStorage
const saveReviewsToStorage = (reviews: Review[]): void => {
  try {
    if (!Array.isArray(reviews)) {
      console.error('Попытка сохранить в localStorage не массив:', reviews);
      return;
    }
    
    localStorage.setItem(REVIEWS_STORAGE_KEY, JSON.stringify(reviews));
    console.log('Отзывы сохранены в localStorage. Количество:', reviews.length);
  } catch (error) {
    console.error('Ошибка при сохранении отзывов в localStorage:', error);
  }
};

interface ReviewsContextType {
  reviews: Review[]; // Добавляем доступ ко всем отзывам
  getProductReviews: (productId: number) => Review[];
  getProductRating: (productId: number) => { rating: number; count: number };
  addReview: (productId: number, review: { rating: number; text: string }) => Promise<{ success: boolean; message?: string }>;
  deleteReview: (reviewId: number) => Promise<{ success: boolean; message?: string }>; // Добавляем функцию удаления отзыва
}

const ReviewsContext = createContext<ReviewsContextType | undefined>(undefined);

interface ReviewsProviderProps {
  children: ReactNode;
}

export const ReviewsProvider: React.FC<ReviewsProviderProps> = ({ children }) => {
  const { auth } = useAuth();
  
  // Инициализируем состояние отзывов, загружая их из localStorage
  const [reviews, setReviews] = useState<Review[]>(() => {
    // Используем функцию инициализации состояния для гарантированного выполнения
    // при первом рендере
    console.log('Инициализация состояния отзывов');
    return loadReviewsFromStorage();
  });

  // Сохраняем отзывы в localStorage при их изменении
  useEffect(() => {
    console.log('useEffect: сохранение отзывов в localStorage, количество:', reviews.length);
    saveReviewsToStorage(reviews);
  }, [reviews]);

  // Функция для получения всех отзывов к товару
  const getProductReviews = (productId: number): Review[] => {
    const productReviews = reviews.filter(review => review.productId === productId);
    console.log(`Получены отзывы для товара #${productId}, количество:`, productReviews.length);
    return productReviews;
  };

  // Функция для расчета среднего рейтинга товара
  const getProductRating = (productId: number): { rating: number; count: number } => {
    const productReviews = getProductReviews(productId);
    const count = productReviews.length;
    
    if (count === 0) {
      return { rating: 0, count: 0 };
    }
    
    const sum = productReviews.reduce((acc, review) => acc + review.rating, 0);
    const averageRating = Math.round((sum / count) * 10) / 10; // Округляем до одного знака после запятой
    
    return { rating: averageRating, count };
  };

  // Функция для добавления нового отзыва
  const addReview = async (productId: number, reviewData: { rating: number; text: string }): Promise<{ success: boolean; message?: string }> => {
    console.log('AddReview start', { productId, reviewData });
    
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      // Имитация асинхронного запроса к серверу
      setTimeout(() => {
        try {
          console.log('AddReview processing', { auth });
          
          if (!auth.isAuthenticated || !auth.user) {
            console.error('User not authenticated');
            resolve({ success: false, message: 'Необходимо авторизоваться для добавления отзыва' });
            return;
          }
          
          console.log('Checking for existing review', { 
            productId, 
            userId: auth.user.id,
            reviewsCount: reviews.length
          });
          
          // Проверка, оставлял ли пользователь уже отзыв к этому товару
          const existingReview = reviews.find(
            (review) => review.productId === productId && review.userId === auth.user!.id
          );
          
          console.log('Existing review check result:', existingReview);
          
          if (existingReview) {
            console.warn('User already left a review for this product');
            resolve({ success: false, message: 'Вы уже оставляли отзыв к этому товару' });
            return;
          }
          
          // Создание нового отзыва
          const newReview: Review = {
            id: Date.now(), // Используем timestamp для уникального ID
            productId,
            userId: auth.user.id,
            author: `${auth.user.firstName} ${auth.user.lastName.charAt(0)}.`,
            rating: reviewData.rating,
            text: reviewData.text,
            date: new Date().toLocaleDateString('ru-RU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric'
            }),
            avatar: auth.user.avatar || 'https://randomuser.me/api/portraits/lego/1.jpg' // Дефолтный аватар
          };
          
          console.log('Created new review:', newReview);
          
          // Добавление отзыва в массив
          setReviews((prevReviews) => {
            const newReviews = [newReview, ...prevReviews];
            console.log('Updated reviews array, new length:', newReviews.length);
            return newReviews;
          });
          
          console.log('Review successfully added');
          resolve({ success: true });
        } catch (error) {
          console.error('Error adding review:', error);
          resolve({ 
            success: false, 
            message: `Произошла ошибка при добавлении отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          });
        }
      }, 800);
    });
  };

  // Функция для удаления отзыва
  const deleteReview = async (reviewId: number): Promise<{ success: boolean; message?: string }> => {
    console.log('DeleteReview start', { reviewId });
    
    return new Promise<{ success: boolean; message?: string }>((resolve) => {
      // Имитация асинхронного запроса к серверу
      setTimeout(() => {
        try {
          console.log('DeleteReview processing');
          
          // Проверяем, существует ли отзыв с указанным ID
          const reviewExists = reviews.some(review => review.id === reviewId);
          
          if (!reviewExists) {
            console.error('Review not found');
            resolve({ success: false, message: 'Отзыв не найден' });
            return;
          }
          
          // Удаляем отзыв из массива
          setReviews((prevReviews) => {
            const updatedReviews = prevReviews.filter(review => review.id !== reviewId);
            console.log('Updated reviews array after deletion, new length:', updatedReviews.length);
            return updatedReviews;
          });
          
          console.log('Review successfully deleted');
          resolve({ success: true, message: 'Отзыв успешно удален' });
        } catch (error) {
          console.error('Error deleting review:', error);
          resolve({ 
            success: false, 
            message: `Произошла ошибка при удалении отзыва: ${error instanceof Error ? error.message : 'Неизвестная ошибка'}`
          });
        }
      }, 500);
    });
  };

  const contextValue: ReviewsContextType = {
    reviews, // Предоставляем доступ ко всем отзывам
    getProductReviews,
    getProductRating,
    addReview,
    deleteReview // Добавляем функцию удаления отзыва в контекст
  };

  return (
    <ReviewsContext.Provider value={contextValue}>
      {children}
    </ReviewsContext.Provider>
  );
};

export const useReviews = (): ReviewsContextType => {
  const context = useContext(ReviewsContext);
  if (context === undefined) {
    throw new Error('useReviews must be used within a ReviewsProvider');
  }
  return context;
}; 