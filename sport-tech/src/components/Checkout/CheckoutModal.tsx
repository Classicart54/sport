import React, { useState } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions, 
  Button, 
  TextField, 
  Typography, 
  Grid,
  Stepper,
  Step,
  StepLabel,
  InputAdornment,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import './CheckoutModal.scss';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  // Срок аренды
  rentalDays: string;
  
  // Данные карты
  cardNumber: string;
  cardName: string;
  cardExpiry: string;
  cardCVC: string;
  
  // Адрес доставки
  fullName: string;
  phone: string;
  city: string;
  address: string;
  postalCode: string;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({ open, onClose }) => {
  const { cart, clearCart } = useCart();
  const { auth } = useAuth();
  const { addOrder } = useOrders();
  const [activeStep, setActiveStep] = useState(0);
  const [completed, setCompleted] = useState(false);
  
  // Начальное состояние формы
  const [formData, setFormData] = useState<FormData>({
    rentalDays: '7',
    cardNumber: '',
    cardName: '',
    cardExpiry: '',
    cardCVC: '',
    fullName: '',
    phone: '',
    city: '',
    address: '',
    postalCode: ''
  });

  // Шаги оформления заказа
  const steps = ['Срок аренды', 'Оплата', 'Доставка'];

  // Обновление данных формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Обработка изменения значения Select
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name as string]: value
    });
  };

  // Обработка ввода номера карты (добавление пробелов)
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\s/g, '');
    if (value.length > 16) value = value.slice(0, 16);
    
    // Добавляем пробелы после каждых 4 цифр
    const formattedValue = value.replace(/(.{4})/g, '$1 ').trim();
    
    setFormData({
      ...formData,
      cardNumber: formattedValue
    });
  };

  // Обработка ввода срока действия карты
  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    
    if (value.length > 4) value = value.slice(0, 4);
    
    if (value.length >= 2) {
      value = value.slice(0, 2) + '/' + value.slice(2);
    }
    
    setFormData({
      ...formData,
      cardExpiry: value
    });
  };

  // Переход к следующему шагу
  const handleNext = () => {
    if (activeStep === steps.length - 1) {
      // Завершение оформления заказа
      handleSubmit();
    } else {
      setActiveStep((prevStep) => prevStep + 1);
    }
  };

  // Возврат к предыдущему шагу
  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  // Закрытие модального окна
  const handleCloseModal = () => {
    if (!completed) {
      onClose();
      return;
    }
    
    // Если заказ оформлен, очищаем корзину при закрытии
    clearCart();
    onClose();
    setActiveStep(0);
    setCompleted(false);
    setFormData({
      rentalDays: '7',
      cardNumber: '',
      cardName: '',
      cardExpiry: '',
      cardCVC: '',
      fullName: '',
      phone: '',
      city: '',
      address: '',
      postalCode: ''
    });
  };

  // Отправка формы
  const handleSubmit = () => {
    // Проверяем, авторизован ли пользователь
    if (!auth.isAuthenticated || !auth.user) {
      console.error('Пользователь не авторизован');
      return;
    }

    try {
      // Создаем новый заказ через OrderContext
      const newOrder = addOrder({
        userId: auth.user.id,
        items: cart.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: cart.subtotal,
        status: 'active',
        rentalDays: parseInt(formData.rentalDays),
        returnDate: '' // Это поле будет рассчитано внутри addOrder
      });

      console.log('Заказ успешно создан:', newOrder);
      
      // После успешного создания заказа показываем уведомление
      setTimeout(() => {
        setCompleted(true);
      }, 1000);
    } catch (error) {
      console.error('Ошибка при создании заказа:', error);
    }
  };

  // Проверка заполнения полей на текущем шаге
  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Срок аренды
        return formData.rentalDays !== '';
      case 1: // Оплата
        return (
          formData.cardNumber.replace(/\s/g, '').length === 16 &&
          formData.cardName.length > 0 &&
          formData.cardExpiry.length === 5 &&
          formData.cardCVC.length === 3
        );
      case 2: // Доставка
        return (
          formData.fullName.length > 0 &&
          formData.phone.length > 0 &&
          formData.city.length > 0 &&
          formData.address.length > 0 &&
          formData.postalCode.length > 0
        );
      default:
        return false;
    }
  };

  // Содержимое шага срока аренды
  const renderRentalStep = () => (
    <Grid container spacing={3} className="checkout-modal__rental">
      <Grid item xs={12}>
        <Typography variant="h6" className="checkout-modal__subtitle">
          Выберите срок аренды
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl fullWidth>
          <InputLabel id="rental-days-label">Срок аренды в днях</InputLabel>
          <Select
            labelId="rental-days-label"
            name="rentalDays"
            value={formData.rentalDays}
            onChange={handleSelectChange}
            startAdornment={
              <InputAdornment position="start">
                <DateRangeIcon />
              </InputAdornment>
            }
          >
            <MenuItem value="3">3 дня</MenuItem>
            <MenuItem value="7">7 дней</MenuItem>
            <MenuItem value="14">14 дней</MenuItem>
            <MenuItem value="30">30 дней</MenuItem>
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" className="checkout-modal__info">
          Общая стоимость аренды: {(cart.subtotal * parseInt(formData.rentalDays)).toFixed(2)} ₽
        </Typography>
        <Typography variant="body2" className="checkout-modal__info">
          Залог: {(cart.subtotal * 0.5).toFixed(2)} ₽ (возвращается после завершения аренды)
        </Typography>
      </Grid>
    </Grid>
  );

  // Содержимое шага оплаты
  const renderPaymentStep = () => (
    <Grid container spacing={3} className="checkout-modal__payment">
      <Grid item xs={12}>
        <Typography variant="h6" className="checkout-modal__subtitle">
          Данные банковской карты
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Номер карты"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleCardNumberChange}
          placeholder="0000 0000 0000 0000"
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CreditCardIcon />
              </InputAdornment>
            ),
          }}
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Имя держателя карты"
          name="cardName"
          value={formData.cardName}
          onChange={handleChange}
          placeholder="IVAN IVANOV"
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="Срок действия"
          name="cardExpiry"
          value={formData.cardExpiry}
          onChange={handleExpiryChange}
          placeholder="MM/YY"
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={6}>
        <TextField
          label="CVC/CVV"
          name="cardCVC"
          value={formData.cardCVC}
          onChange={(e) => {
            const value = e.target.value.replace(/\D/g, '');
            if (value.length <= 3) {
              setFormData({
                ...formData,
                cardCVC: value
              });
            }
          }}
          placeholder="***"
          type="password"
          fullWidth
          required
        />
      </Grid>
    </Grid>
  );

  // Содержимое шага доставки
  const renderDeliveryStep = () => (
    <Grid container spacing={3} className="checkout-modal__delivery">
      <Grid item xs={12}>
        <Typography variant="h6" className="checkout-modal__subtitle">
          Адрес доставки
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="ФИО"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Телефон"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          fullWidth
          required
          placeholder="+7 (000) 000-00-00"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Город"
          name="city"
          value={formData.city}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Адрес"
          name="address"
          value={formData.address}
          onChange={handleChange}
          fullWidth
          required
          placeholder="Улица, дом, квартира"
        />
      </Grid>
      <Grid item xs={12}>
        <TextField
          label="Почтовый индекс"
          name="postalCode"
          value={formData.postalCode}
          onChange={handleChange}
          fullWidth
          required
        />
      </Grid>
    </Grid>
  );

  // Содержимое успешного оформления заказа
  const renderCompletedStep = () => (
    <div className="checkout-modal__completed">
      <CheckCircleOutlineIcon className="checkout-modal__success-icon" />
      <Typography variant="h5" className="checkout-modal__success-title">
        Заказ успешно оформлен
      </Typography>
      <Typography variant="body1" className="checkout-modal__success-text">
        Благодарим за ваш заказ! Вы арендовали оборудование на {formData.rentalDays} дней.
        Информация о заказе отправлена на вашу электронную почту.
      </Typography>
      <Button 
        variant="contained" 
        color="primary" 
        className="checkout-modal__success-button"
        onClick={handleCloseModal}
      >
        Вернуться в магазин
      </Button>
    </div>
  );

  // Определение содержимого активного шага
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderRentalStep();
      case 1:
        return renderPaymentStep();
      case 2:
        return renderDeliveryStep();
      default:
        return 'Неизвестный шаг';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      fullWidth
      maxWidth="sm"
      className="checkout-modal"
    >
      <DialogTitle className="checkout-modal__title">
        {completed ? 'Заказ оформлен' : 'Оформление заказа'}
        <IconButton
          aria-label="close"
          onClick={handleCloseModal}
          className="checkout-modal__close-button"
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      
      <DialogContent className="checkout-modal__content">
        {completed ? (
          renderCompletedStep()
        ) : (
          <>
            <Stepper activeStep={activeStep} className="checkout-modal__stepper">
              {steps.map((label) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                </Step>
              ))}
            </Stepper>
            
            <div className="checkout-modal__step-content">
              {getStepContent(activeStep)}
            </div>
          </>
        )}
      </DialogContent>
      
      {!completed && (
        <DialogActions className="checkout-modal__actions">
          <Button 
            onClick={handleCloseModal} 
            color="inherit"
            className="checkout-modal__cancel-button"
          >
            Отмена
          </Button>
          <div>
            {activeStep > 0 && (
              <Button 
                onClick={handleBack} 
                className="checkout-modal__back-button"
              >
                Назад
              </Button>
            )}
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!isStepValid()}
              className="checkout-modal__next-button"
            >
              {activeStep === steps.length - 1 ? 'Оформить заказ' : 'Далее'}
            </Button>
          </div>
        </DialogActions>
      )}
    </Dialog>
  );
};

export default CheckoutModal; 