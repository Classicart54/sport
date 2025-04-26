import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext'; 
import { Button, Typography, Box } from '@mui/material';
import CheckoutModal from '../../components/Checkout/CheckoutModal';
import './CartPage.scss';

const CartPage: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, clearCart, subtotal } = useCart();
  const { auth, openLoginModal } = useAuth();
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const handleOpenCheckoutModal = () => {
    if (!auth.isAuthenticated) {
      openLoginModal();
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  const handleCloseCheckoutModal = () => {
    setIsCheckoutModalOpen(false);
  };

  if (!auth.isAuthenticated) {
    return (
      <div className="cart-page cart-page--empty">
        <h1>Для оформления заказа необходимо войти</h1>
        <p>Пожалуйста, войдите в свой аккаунт или зарегистрируйтесь</p>
        <Box mt={3} display="flex" gap={2} justifyContent="center">
          <Button 
            variant="contained" 
            color="primary" 
            onClick={openLoginModal}
            className="cart-page__auth-button"
          >
            Войти
          </Button>
          <Button 
            variant="outlined"
            component={Link} 
            to="/" 
            className="cart-page__continue-shopping"
          >
            На главную
          </Button>
        </Box>
      </div>
    );
  }

  if (cart.items.length === 0) {
    return (
      <div className="cart-page cart-page--empty">
        <h1>Корзина пуста</h1>
        <p>Добавьте товары в корзину, чтобы оформить заказ</p>
        <Link to="/" className="cart-page__continue-shopping">
          Продолжить покупки
        </Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1>Корзина</h1>
      <div className="cart-page__content">
        <div className="cart-page__items">
          {cart.items.map((item) => (
            <div key={item.id} className="cart-item">
              <div className="cart-item__image">
                <img src={item.product.image} alt={item.product.name} />
              </div>
              <div className="cart-item__details">
                <Link to={`/product/${item.product.id}`} className="cart-item__name">
                  {item.product.name}
                </Link>
                <div className="cart-item__price">{item.product.price} ₽</div>
              </div>
              <div className="cart-item__quantity">
                <button 
                  className="cart-item__quantity-btn"
                  onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span>{item.quantity}</span>
                <button 
                  className="cart-item__quantity-btn"
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <div className="cart-item__total">
                {(item.product.price * item.quantity).toFixed(2)} ₽
              </div>
              <button 
                className="cart-item__remove"
                onClick={() => removeFromCart(item.id)}
              >
                Удалить
              </button>
            </div>
          ))}
        </div>
        <div className="cart-page__summary">
          <h2>Сумма заказа</h2>
          <div className="cart-page__summary-row">
            <span>Промежуточный итог:</span>
            <span>{subtotal.toFixed(2)} ₽</span>
          </div>
          <div className="cart-page__summary-row">
            <span>Доставка:</span>
            <span>Бесплатно</span>
          </div>
          <div className="cart-page__summary-row cart-page__summary-row--total">
            <span>Итого:</span>
            <span>{subtotal.toFixed(2)} ₽</span>
          </div>
          <button 
            className="cart-page__checkout"
            onClick={handleOpenCheckoutModal}
          >
            Оформить заказ
          </button>
          <button 
            className="cart-page__clear"
            onClick={clearCart}
          >
            Очистить корзину
          </button>
          <Link to="/" className="cart-page__continue-shopping">
            Продолжить покупки
          </Link>
        </div>
      </div>
      
      {/* Модальное окно оформления заказа */}
      <CheckoutModal 
        open={isCheckoutModalOpen} 
        onClose={handleCloseCheckoutModal} 
      />
    </div>
  );
};

export default CartPage; 