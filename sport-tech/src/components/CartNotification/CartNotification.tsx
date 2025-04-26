import React, { useEffect } from 'react';
import { Box, Typography, IconButton, Paper } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import { Link } from 'react-router-dom';
import './CartNotification.scss';

interface CartNotificationProps {
  open: boolean;
  onClose: () => void;
  productName: string;
}

const CartNotification: React.FC<CartNotificationProps> = ({ open, onClose, productName }) => {
  // Автоматически закрываем уведомление через 3 секунды
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onClose();
      }, 3000);
      
      return () => {
        clearTimeout(timer);
      };
    }
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return (
    <Paper className="cart-notification">
      <Box className="cart-notification__content">
        <CheckCircleOutlineIcon className="cart-notification__icon" />
        <Box className="cart-notification__text">
          <Typography variant="body1" className="cart-notification__title">
            Товар добавлен в корзину
          </Typography>
          <Typography variant="body2" className="cart-notification__product-name">
            {productName}
          </Typography>
        </Box>
        <IconButton 
          size="small" 
          className="cart-notification__close"
          onClick={onClose}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </Box>
      <Box className="cart-notification__actions">
        <Link to="/cart" className="cart-notification__link" onClick={onClose}>
          Перейти в корзину
        </Link>
      </Box>
    </Paper>
  );
};

export default CartNotification; 