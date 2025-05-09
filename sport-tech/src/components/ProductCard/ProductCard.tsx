import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button, Rating, Chip } from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import CommentIcon from '@mui/icons-material/Comment';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { Product } from '../../types/interfaces';
import { useAuth } from '../../context/AuthContext';
import { useReviews } from '../../context/ReviewsContext';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product;
  showRating?: boolean;
}

const ProductCard: FC<ProductCardProps> = ({ product, showRating = false }) => {
  const { auth, openLoginModal } = useAuth();
  const { getProductRating } = useReviews();
  
  // Проверка наличия данных товара
  if (!product) {
    return null;
  }

  const handleRentClick = () => {
    if (!auth.isAuthenticated) {
      openLoginModal();
    }
  };

  // Получаем рейтинг товара
  const { rating, count } = getProductRating(product.id);
  
  // Проверка доступности товара
  const isAvailable = product.available !== false;

  return (
    <Box className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <Box 
          className={`product-card__image ${!isAvailable ? 'product-card__image--unavailable' : ''}`}
          style={{ 
            backgroundImage: `url(${product.image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
        
        {showRating && count > 0 && (
          <Box className="product-card__rating-badge">
            <Box display="flex" alignItems="center" gap={0.5}>
              <StarIcon fontSize="small" />
              <Typography variant="body2">{rating.toFixed(1)}</Typography>
            </Box>
          </Box>
        )}
        
        {!isAvailable && (
          <Box className="product-card__unavailable-badge">
            <ErrorOutlineIcon fontSize="small" />
            <Typography variant="body2">Недоступен</Typography>
          </Box>
        )}
      </Link>
      
      <Box className="product-card__content">
        <Typography variant="body1" className="product-card__price">
          От {product.price} ₽ в день
        </Typography>
        
        <Link to={`/product/${product.id}`} className="product-card__title-link">
          <Typography variant="h3" className="product-card__title">
            {product.name}
          </Typography>
        </Link>
        
        {showRating && (
          <Box className="product-card__rating" display="flex" alignItems="center" gap={1} mb={1}>
            <Rating 
              value={rating} 
              precision={0.5} 
              readOnly 
              size="small"
            />
            <Chip
              icon={<CommentIcon fontSize="small" />}
              label={`${count} ${count === 1 ? 'отзыв' : count >= 2 && count <= 4 ? 'отзыва' : 'отзывов'}`}
              size="small"
              variant="outlined"
              color="primary"
            />
          </Box>
        )}
        
        {isAvailable ? (
          auth.isAuthenticated ? (
          <Button 
            variant="contained" 
            className="product-card__button"
            component={Link}
            to={`/product/${product.id}`}
          >
            Арендовать
          </Button>
        ) : (
          <Button 
            variant="contained" 
            className="product-card__button"
            onClick={handleRentClick}
          >
            Войти и арендовать
            </Button>
          )
        ) : (
          <Button 
            variant="contained" 
            className="product-card__button product-card__button--unavailable"
            disabled
          >
            Недоступен
          </Button>
        )}
      </Box>
    </Box>
  );
};

export default ProductCard; 