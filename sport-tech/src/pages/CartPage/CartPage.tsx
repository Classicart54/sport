import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Button, TextField, FormControl, InputLabel, Select, MenuItem, Divider, Paper, Grid, IconButton } from '@mui/material';
import { Delete as DeleteIcon, Add as AddIcon, Remove as RemoveIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { Product } from '../../types/interfaces';
import Layout from '../../components/Layout';
import './CartPage.scss';
import { Link } from 'react-router-dom';

const CartPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { cart, removeFromCart, updateQuantity, clearCart, totalPrice } = useCart();
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    address: '',
    comment: '',
  });

  // Проверка авторизации
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  // Проверка на недоступные товары
  useEffect(() => {
    // Проверяем каждый товар в корзине
    const unavailableItems = cart.filter(item => item.product.available === false);
    
    // Если есть недоступные товары, удаляем их из корзины
    if (unavailableItems.length > 0) {
      unavailableItems.forEach(item => {
        removeFromCart(item.product.id);
      });
      
      // Тут можно добавить уведомление пользователю
      alert('Некоторые товары были удалены из корзины, так как они стали недоступны для аренды');
    }
  }, [cart, removeFromCart]);

  const handleCheckout = () => {
    // Логика оформления заказа
    // ...

    // Очистка корзины
    clearCart();
    
    // Переход на страницу успешного оформления
    navigate('/checkout-success');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setContactInfo({
      ...contactInfo,
      [name]: value,
    });
  };

  return (
    <Layout>
      <div className="cart-page">
        <Container>
          <Typography variant="h4" component="h1" className="cart-page__title">
            Корзина
          </Typography>
          
          {cart.length === 0 ? (
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
                to="/catalog"
              >
                Перейти в каталог
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper className="cart-page__items">
                  {cart.map((item) => (
                    <div key={item.product.id} className="cart-page__item">
                      <div className="cart-page__item-image" style={{ backgroundImage: `url(${item.product.image})` }}></div>
                      <div className="cart-page__item-details">
                        <Typography variant="h6" className="cart-page__item-title">
                          {item.product.name}
                        </Typography>
                        <Typography variant="body2" className="cart-page__item-price">
                          {item.product.price} ₽ / день
                        </Typography>
                      </div>
                      <div className="cart-page__item-controls">
                        <Box className="cart-page__quantity-control">
                          <IconButton 
                            size="small" 
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          >
                            <RemoveIcon />
                          </IconButton>
                          <TextField
                            value={item.quantity}
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
                            onClick={() => updateQuantity(item.product.id, Math.min(10, item.quantity + 1))}
                          >
                            <AddIcon />
                          </IconButton>
                        </Box>
                        <Box className="cart-page__days-control">
                          <FormControl size="small" className="cart-page__days-select">
                            <InputLabel>Дней</InputLabel>
                            <Select
                              value={item.days}
                              label="Дней"
                              onChange={(e) => updateQuantity(item.product.id, item.quantity, Number(e.target.value))}
                            >
                              {[1, 2, 3, 5, 7, 10, 14, 30].map(days => (
                                <MenuItem key={days} value={days}>{days} {days === 1 ? 'день' : days < 5 ? 'дня' : 'дней'}</MenuItem>
                              ))}
                            </Select>
                          </FormControl>
                        </Box>
                        <Typography variant="body1" className="cart-page__item-subtotal">
                          {item.product.price * item.quantity * item.days} ₽
                        </Typography>
                        <IconButton 
                          color="error" 
                          onClick={() => removeFromCart(item.product.id)}
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
                      {cart.reduce((sum, item) => sum + item.quantity, 0)}
                    </Typography>
                  </Box>
                  <Box className="cart-page__summary-row">
                    <Typography variant="body1">
                      Общая стоимость
                    </Typography>
                    <Typography variant="body1" fontWeight="bold">
                      {totalPrice} ₽
                    </Typography>
                  </Box>
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="phone"
                    label="Телефон"
                    type="tel"
                    value={contactInfo.phone}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    required
                    fullWidth
                    name="address"
                    label="Адрес доставки"
                    value={contactInfo.address}
                    onChange={handleInputChange}
                  />
                  <TextField
                    margin="normal"
                    fullWidth
                    name="comment"
                    label="Комментарий"
                    multiline
                    rows={3}
                    value={contactInfo.comment}
                    onChange={handleInputChange}
                  />
                  <Button
                    fullWidth
                    variant="contained"
                    color="primary"
                    size="large"
                    onClick={handleCheckout}
                    disabled={!contactInfo.phone || !contactInfo.address || cart.length === 0}
                    className="cart-page__checkout-button"
                  >
                    Оформить заказ
                  </Button>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </div>
    </Layout>
  );
};

export default CartPage; 