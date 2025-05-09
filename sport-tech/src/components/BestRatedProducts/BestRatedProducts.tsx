import { FC, useEffect, useState } from 'react';
import { Box, Typography, Container, CircularProgress, Button, Tooltip } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import ProductCard from '../ProductCard/ProductCard';
import { Product } from '../../types/interfaces';
import { apiService } from '../../api';
import { useReviews } from '../../context/ReviewsContext';
import './BestRatedProducts.scss';

const BestRatedProducts: FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Получаем отзывы напрямую из контекста
  const { reviews } = useReviews();

  // Функция загрузки данных
  const fetchBestRatedProducts = async (showLoader = true) => {
    try {
      if (showLoader) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      
      // Получаем товары с лучшим рейтингом
      const bestRatedProducts = await apiService.products.getBestRatedProducts(4);
      console.log('Получены товары с лучшим рейтингом:', bestRatedProducts);
      
      if (Array.isArray(bestRatedProducts)) {
        setProducts(bestRatedProducts);
        setError(null);
      } else {
        throw new Error('Неверный формат данных');
      }
    } catch (err) {
      console.error('Ошибка при загрузке лучших товаров:', err);
      setError('Не удалось загрузить рекомендуемые товары');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Загружаем данные при монтировании компонента
  useEffect(() => {
    console.log('Первоначальная загрузка данных');
    fetchBestRatedProducts();
  }, []);

  // Обновляем данные при изменении отзывов
  useEffect(() => {
    if (!isLoading && !isRefreshing) {
      console.log('Обновление данных из-за изменения отзывов:', reviews.length);
      fetchBestRatedProducts(false);
    }
  }, [reviews, isLoading, isRefreshing]);

  // Обработчик ручного обновления
  const handleRefresh = () => {
    console.log('Ручное обновление данных');
    fetchBestRatedProducts(false);
  };

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', padding: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Если нет данных или ошибка, не отображаем секцию
  if (error || products.length === 0) {
    return null;
  }

  return (
    <Box className="best-rated">
      <Container maxWidth={false} className="best-rated__container">
        <Box className="best-rated__header">
          <Typography variant="h2" className="best-rated__title">
            Лучшие товары по оценкам
          </Typography>
          <Box display="flex" alignItems="center" justifyContent="center" gap={1} mb={2}>
            <Typography variant="body1" className="best-rated__subtitle">
              Выбор наших клиентов на основе отзывов
            </Typography>
            <Tooltip title="Обновить рейтинг">
              <Button 
                onClick={handleRefresh}
                disabled={isRefreshing}
                color="primary"
                size="small"
                sx={{ minWidth: 'auto', p: 0.5 }}
              >
                <RefreshIcon fontSize="small" sx={{ animation: isRefreshing ? 'spin 1s linear infinite' : 'none' }} />
              </Button>
            </Tooltip>
          </Box>
        </Box>
        
        <Box 
          className="best-rated__grid" 
          sx={{ 
            display: 'grid', 
            gridTemplateColumns: { 
              xs: '1fr', 
              sm: 'repeat(2, 1fr)', 
              md: 'repeat(4, 1fr)' 
            }, 
            gap: 2 
          }}
        >
          {products.map((product) => (
            <Box key={product.id}>
              <ProductCard product={product} showRating={true} />
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
};

export default BestRatedProducts; 