import React from 'react';
import { Snackbar, Alert, AlertTitle, Typography, Box, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import './CartNotification.scss';

interface CartNotificationProps {
  open: boolean;
  onClose: () => void;
  productName: string | null;
}

const CartNotification: React.FC<CartNotificationProps> = ({ open, onClose, productName }) => {
  const navigate = useNavigate();

  const handleGoToCart = () => {
    navigate('/cart');
    onClose();
  };

  return (
    <Snackbar
      open={open}
      autoHideDuration={4000}
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      className="cart-notification"
    >
      <Alert 
        severity="success" 
        variant="filled"
        onClose={onClose}
        sx={{ width: '100%', alignItems: 'center' }}
      >
        <AlertTitle sx={{ mb: 0.5, fontWeight: 'bold' }}>Товар добавлен!</AlertTitle>
        {productName && (
          <Typography variant="body2" sx={{ mb: 1 }}>
            {productName}
          </Typography>
        )}
        <Typography 
          component="span" 
          onClick={handleGoToCart}
          sx={{ 
            cursor: 'pointer', 
            textDecoration: 'underline', 
            fontSize: '0.85rem',
            fontWeight: 'medium'
          }}
        >
          Перейти в корзину
        </Typography>
      </Alert>
    </Snackbar>
  );
};

export default CartNotification; 