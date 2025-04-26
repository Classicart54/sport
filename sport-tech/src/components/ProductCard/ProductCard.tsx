import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Button } from '@mui/material';
import { Product } from '../../types/interfaces';
import { useAuth } from '../../context/AuthContext';
import './ProductCard.scss';

interface ProductCardProps {
  product: Product;
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const { auth, openLoginModal } = useAuth();
  
  // Проверка наличия данных товара
  if (!product) {
    return null;
  }

  const handleRentClick = () => {
    if (!auth.isAuthenticated) {
      openLoginModal();
    }
  };

  return (
    <Box className="product-card">
      <Link to={`/product/${product.id}`} className="product-card__link">
        <Box 
          className="product-card__image" 
          style={{ 
            backgroundImage: `url(${product.image})`,
            backgroundPosition: 'center',
            backgroundSize: 'cover'
          }}
        />
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
        
        {auth.isAuthenticated ? (
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
        )}
      </Box>
    </Box>
  );
};

export default ProductCard; 