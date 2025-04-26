import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Rating, Divider, Paper } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { products } from '../../data/mockData';
import { Product, Review } from '../../types/interfaces';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useReviews } from '../../context/ReviewsContext';
import ReviewsList from '../../components/Reviews/ReviewsList';
import AddReviewForm from '../../components/Reviews/AddReviewForm';
import './ProductPage.scss';

const ProductPage: FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const navigate = useNavigate();
  const { auth, openLoginModal } = useAuth();
  const { addToCart } = useCart();
  const { getProductReviews, getProductRating, addReview } = useReviews();
  const [showAllReviews, setShowAllReviews] = useState(false);
  
  // Получаем отзывы и рейтинг товара
  const productIdNumber = productId ? parseInt(productId) : 0;
  const [reviews, setReviews] = useState<Review[]>([]);
  const [productRating, setProductRating] = useState<{ rating: number; count: number }>({ rating: 0, count: 0 });
  
  // Загружаем отзывы и рейтинг при изменении productId
  useEffect(() => {
    if (productIdNumber) {
      const productReviews = getProductReviews(productIdNumber);
      setReviews(productReviews);
      setProductRating(getProductRating(productIdNumber));
    }
  }, [productIdNumber, getProductReviews, getProductRating]);
  
  // Лимит количества отзывов на странице
  const reviewsLimit = 3;
  const displayedReviews = showAllReviews ? reviews : reviews.slice(0, reviewsLimit);

  useEffect(() => {
    if (productId) {
      const foundProduct = products.find(item => item.id === parseInt(productId));
      setProduct(foundProduct || null);
      window.scrollTo(0, 0);
    }
  }, [productId]);

  // Обновляем список отзывов
  const refreshReviews = () => {
    console.log('Refreshing reviews for product', productIdNumber);
    if (productIdNumber) {
      const updatedReviews = getProductReviews(productIdNumber);
      console.log('Updated reviews:', updatedReviews);
      setReviews(updatedReviews);
      setProductRating(getProductRating(productIdNumber));
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Возврат на предыдущую страницу
  };

  const handleAddToCart = () => {
    if (!auth.isAuthenticated) {
      openLoginModal();
      return;
    }
    
    if (product) {
      addToCart(product, 1);
    }
  };
  
  // Обработчик добавления нового отзыва
  const handleAddReview = async (reviewData: { rating: number; text: string }) => {
    console.log('ProductPage handleAddReview called with:', reviewData);
    
    try {
      const response = await addReview(productIdNumber, reviewData);
      console.log('ProductPage received response from addReview:', response);
      
      // Если успешно добавлен отзыв, обновляем список отзывов
      if (response.success) {
        console.log('Review successfully added, updating UI');
        refreshReviews();
        
        // Если отзывов мало, показываем все сразу после добавления нового
        if (reviews.length <= reviewsLimit) {
          setShowAllReviews(true);
        }
      } else {
        console.warn('Failed to add review:', response.message);
      }
      
      return response;
    } catch (error) {
      console.error('Error in handleAddReview:', error);
      return { 
        success: false, 
        message: 'Произошла непредвиденная ошибка при добавлении отзыва' 
      };
    }
  };
  
  // Обработчик показа всех отзывов
  const handleShowAllReviews = () => {
    setShowAllReviews(true);
  };

  if (!product) {
    return (
      <Container>
        <Box sx={{ py: 5, textAlign: 'center' }}>
          <Typography variant="h4">Товар не найден</Typography>
          <Button 
            startIcon={<ArrowBackIcon />} 
            variant="outlined" 
            onClick={handleGoBack}
            sx={{ mt: 3 }}
          >
            Вернуться назад
          </Button>
        </Box>
      </Container>
    );
  }

  // Добавляем описание продукта, если его нет в данных
  const description = product.description || 
    `${product.name} создан для тех, кому важна функциональность и качество. Сенсорные кнопки на консоли для максимально легкого управления тренажером во время занятий. Конструкция учитывает все потребности атлета. Продуманная система амортизации с 4 кушонами рифленой формы по периметру обеспечит максимальный комфорт во время тренировки. Уровень шума 69 дБ в соответствии со стандартами ISO.`;

  return (
    <Box className="product-page">
      <Container maxWidth="lg">
        <Button 
          className="product-page__back-button"
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
        >
          Вернуться назад
        </Button>

        <div className="product-page__content">
          <div className="product-page__left">
            <Box className="product-page__image-container">
              <Box 
                className="product-page__image"
                style={{ backgroundImage: `url(${product.image})` }}
              />
              <Box className="product-page__thumbnails">
                <Box 
                  className="product-page__thumbnail"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <Box 
                  className="product-page__thumbnail"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
                <Box 
                  className="product-page__thumbnail"
                  style={{ backgroundImage: `url(${product.image})` }}
                />
              </Box>
            </Box>
          </div>
          
          <div className="product-page__right">
            <Box className="product-page__info">
              <Typography variant="subtitle1" className="product-page__brand">
                {product.name.split(' ')[0]}
              </Typography>
              
              <Typography variant="h4" className="product-page__title">
                {product.name}
              </Typography>
              
              <Box className="product-page__rating">
                <Rating value={productRating.rating} readOnly precision={0.5} />
                <Typography variant="body2" className="product-page__reviews-count">
                  {productRating.count > 0 ? `${productRating.count} ${productRating.count === 1 ? 'отзыв' : productRating.count < 5 ? 'отзыва' : 'отзывов'}` : 'Нет отзывов'}
                </Typography>
              </Box>
              
              <Typography variant="h3" className="product-page__price">
                От {product.price} ₽ в день
              </Typography>
              
              <Typography variant="body1" className="product-page__description">
                {description}
              </Typography>
              
              <Button 
                variant="contained" 
                className="product-page__add-button"
                onClick={handleAddToCart}
              >
                {auth.isAuthenticated ? 'В корзину' : 'Войти и арендовать'}
              </Button>
              
              {!auth.isAuthenticated && (
                <Typography variant="body2" className="product-page__auth-note">
                  Для аренды необходимо войти в личный кабинет
                </Typography>
              )}
            </Box>
          </div>
        </div>

        {/* Секция отзывов */}
        <div id="reviews-section" className="product-page__reviews-section">
          <Divider className="product-page__divider" />
          
          <Typography variant="h4" className="product-page__section-title">
            Отзывы {productRating.count > 0 && `(${productRating.count})`}
          </Typography>
          
          {/* Форма добавления отзыва */}
          <AddReviewForm productId={productIdNumber} onAddReview={handleAddReview} />
          
          {/* Список отзывов */}
          <ReviewsList 
            reviews={displayedReviews} 
            totalReviews={reviews.length} 
            onLoadMore={!showAllReviews && reviews.length > reviewsLimit ? handleShowAllReviews : undefined} 
          />
        </div>
      </Container>
    </Box>
  );
};

export default ProductPage; 