import React, { useState } from 'react';
import { 
  Container, 
  Typography, 
  Box, 
  Button, 
  TextField, 
  Divider, 
  Paper, 
  Grid, 
  IconButton
} from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CheckoutModal from '../../components/Checkout/CheckoutModal';
import './CartPage.scss';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { auth } = useAuth();
  const { cart, removeFromCart, updateQuantity, updateDays, clearCart, subtotal } = useCart();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  // Проверяем, что корзина существует и имеет массив items
  const cartItems = cart?.items || [];
  const hasItems = Array.isArray(cartItems) && cartItems.length > 0;

  const handleOpenCheckoutModal = () => {
    if (!auth || !auth.isAuthenticated) {
      alert('Для оформления заказа необходимо авторизоваться');
      return;
    }
    
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  return (
    <div className="cart-page">
      <Container>
        <Typography variant="h4" component="h1" className="cart-page__title">
          Корзина
        </Typography>
        
        {!hasItems ? (
          <Paper className="cart-page__empty">
            <Typography variant="h6" gutterBottom>
              Ваша корзина пуста
            </Typography>
            <Typography variant="body1" paragraph>
              Добавьте товары для аренды
            </Typography>
            <Button 
              variant="contained" 
              component={Link} 
              to="/"
            >
              Перейти на главную
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper className="cart-page__items">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-page__item">
                    <div 
                      className="cart-page__item-image" 
                      style={{ backgroundImage: `url(${item.product?.image || ''})` }}
                    ></div>
                    <div className="cart-page__item-details">
                      <Typography variant="h6" className="cart-page__item-title">
                        {item.product?.name || 'Товар'}
                      </Typography>
                      <Typography variant="body2" className="cart-page__item-price">
                        {item.product?.price || 0} ₽ / день
                      </Typography>
                    </div>
                    <div className="cart-page__item-controls">
                      <Box className="cart-page__quantity-control">
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, Math.max(1, (item.quantity || 1) - 1))}
                        >
                          <RemoveIcon />
                        </IconButton>
                        <TextField
                          value={item.quantity || 1}
                          size="small"
                          type="number"
                          InputProps={{ 
                            inputProps: { min: 1, max: 10 },
                            readOnly: true
                          }}
                          className="cart-page__quantity-input"
                        />
                        <IconButton 
                          size="small" 
                          onClick={() => updateQuantity(item.id, Math.min(10, (item.quantity || 1) + 1))}
                        >
                          <AddIcon />
                        </IconButton>
                      </Box>
                      <Box className="cart-page__days-control">
                        <TextField
                          label="Дней аренды"
                          type="number"
                          size="small"
                          value={item.days || 1}
                          InputProps={{ 
                            inputProps: { min: 1, max: 30 }
                          }}
                          onChange={(e) => updateDays(item.id, Math.max(1, Math.min(30, parseInt(e.target.value) || 1)))}
                          className="cart-page__days-input"
                        />
                      </Box>
                      <Typography variant="body1" className="cart-page__item-subtotal">
                        {(item.product?.price || 0) * (item.quantity || 1) * (item.days || 1)} ₽
                      </Typography>
                      <IconButton 
                        color="error" 
                        onClick={() => removeFromCart(item.id)}
                        className="cart-page__remove-button"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </div>
                  </div>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper className="cart-page__summary">
                <Typography variant="h6" gutterBottom>
                  Итого
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box className="cart-page__summary-row">
                  <Typography variant="body1">
                    Количество товаров
                  </Typography>
                  <Typography variant="body1">
                    {cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)}
                  </Typography>
                </Box>
                <Box className="cart-page__summary-row">
                  <Typography variant="body1">
                    Общая стоимость
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {subtotal || 0} ₽
                  </Typography>
                </Box>
                
                <Box mt={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    * Аренда спортивного оборудования осуществляется с внесением залога 50% от стоимости оборудования
                  </Typography>
                </Box>
                
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  onClick={handleOpenCheckoutModal}
                  disabled={!hasItems}
                  className="cart-page__checkout-button"
                  sx={{ mt: 3 }}
                >
                  Оформить заказ
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  fullWidth
                  size="medium"
                  component={Link}
                  to="/"
                  sx={{ mt: 2 }}
                >
                  Продолжить выбор
                </Button>
              </Paper>
            </Grid>
          </Grid>
        )}
        
        {/* Модальное окно оформления заказа */}
        <CheckoutModal 
          open={isCheckoutModalOpen} 
          onClose={handleCloseCheckoutModal} 
        />
        
      </Container>
    </div>
  );
};

export default CartPage; 