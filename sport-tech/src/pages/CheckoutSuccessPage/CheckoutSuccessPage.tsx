import React from 'react';
import { Container, Typography, Paper, Button, Box } from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import './CheckoutSuccessPage.scss';

const CheckoutSuccessPage: React.FC = () => {
  return (
    <div className="checkout-success-page">
      <Container>
        <Paper className="checkout-success-page__content">
          <Box className="checkout-success-page__icon">
            <CheckCircle color="success" fontSize="large" />
          </Box>
          <Typography variant="h4" gutterBottom className="checkout-success-page__title">
            Заказ успешно оформлен!
          </Typography>
          <Typography variant="body1" paragraph className="checkout-success-page__message">
            Спасибо за ваш заказ. В ближайшее время с вами свяжется наш менеджер для уточнения деталей доставки.
          </Typography>
          <Typography variant="body2" paragraph className="checkout-success-page__info">
            Информация о заказе отправлена на вашу электронную почту.
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            component={Link} 
            to="/"
            className="checkout-success-page__button"
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Container>
    </div>
  );
};

export default CheckoutSuccessPage; 