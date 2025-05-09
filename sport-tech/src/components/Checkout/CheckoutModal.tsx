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
  SelectChangeEvent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';

// Импортируем компоненты react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

import './CheckoutModal.scss';

interface CheckoutModalProps {
  open: boolean;
  onClose: () => void;
}

interface FormData {
  // Даты начала и окончания аренды
  startDate: Date | null;
  endDate: Date | null;
  
  // Способ оплаты
  paymentMethod: 'cash' | 'card';
  
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
  
  // Получаем текущую дату для использования в календаре
  const today = new Date();
  
  // Начальное состояние формы
  const [formData, setFormData] = useState<FormData>({
    startDate: today, // По умолчанию - сегодня
    endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000), // Через неделю
    paymentMethod: 'cash',
    fullName: '',
    phone: '',
    city: '',
    address: '',
    postalCode: ''
  });

  // Шаги оформления заказа
  const steps = ['Период аренды', 'Способ оплаты', 'Доставка'];

  // Обновление данных формы для текстовых полей
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Обработчик изменения даты начала аренды
  const handleStartDateChange = (date: Date | null) => {
    if (!date) return;
    
    setFormData(prev => {
      // Если дата начала позже даты окончания, устанавливаем дату окончания на день позже
      const newEndDate = prev.endDate && date >= prev.endDate 
        ? new Date(date.getTime() + 24 * 60 * 60 * 1000) 
        : prev.endDate;
      
      return {
        ...prev,
        startDate: date,
        endDate: newEndDate
      };
    });
  };

  // Обработчик изменения даты окончания аренды
  const handleEndDateChange = (date: Date | null) => {
    if (!date) return;
    
    setFormData(prev => ({
      ...prev,
      endDate: date
    }));
  };

  // Расчет количества дней между датами
  const calculateRentalDays = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;
    
    const diffTime = Math.abs(formData.endDate.getTime() - formData.startDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays + 1; // +1 чтобы включить оба дня
  };

  // Обработка изменения способа оплаты
  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      paymentMethod: e.target.value as 'cash' | 'card'
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
      startDate: today,
      endDate: new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000),
      paymentMethod: 'cash',
      fullName: '',
      phone: '',
      city: '',
      address: '',
      postalCode: ''
    });
  };

  // Отправка формы
  const handleSubmit = () => {
    // Проверяем, авторизован ли пользователь и выбраны ли даты
    if (!auth.isAuthenticated || !auth.user || !formData.startDate || !formData.endDate) {
      console.error('Пользователь не авторизован или даты не выбраны');
      return;
    }

    try {
      // Рассчитываем количество дней аренды
      const rentalDays = calculateRentalDays();
      
      // Форматируем дату возврата в формат DD.MM.YYYY
      const returnDateString = `${formData.endDate.getDate().toString().padStart(2, '0')}.${(formData.endDate.getMonth() + 1).toString().padStart(2, '0')}.${formData.endDate.getFullYear()}`;

      const newOrder = addOrder({
        userId: auth.user.id,
        items: cart.items.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: cart.subtotal * rentalDays,
        status: 'active',
        rentalDays: rentalDays,
        returnDate: returnDateString
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
      case 0: // Период аренды
        return formData.startDate !== null && 
               formData.endDate !== null && 
               formData.startDate <= formData.endDate;
      case 1: // Способ оплаты
        return formData.paymentMethod === 'cash' || formData.paymentMethod === 'card';
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

  // Форматирование даты в читабельный вид
  const formatDate = (date: Date | null): string => {
    if (!date) return '';
    return `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
  };

  // Содержимое шага выбора периода аренды
  const renderRentalStep = () => {
    const rentalDays = calculateRentalDays();
    const totalRentalCost = (cart.subtotal * rentalDays).toFixed(2);
    const depositAmount = (cart.subtotal * 0.5).toFixed(2);

    return (
    <Grid container spacing={3} className="checkout-modal__rental">
        <Grid item xs={12}>
          <Typography variant="h6" className="checkout-modal__subtitle">
            Выберите период аренды
          </Typography>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className="datepicker-container">
            <label>Дата начала аренды</label>
            <DatePicker
              selected={formData.startDate}
              onChange={handleStartDateChange}
              selectsStart
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={today}
              dateFormat="dd.MM.yyyy"
              className="datepicker-input"
              placeholderText="Выберите дату начала"
            />
          </div>
        </Grid>
        <Grid item xs={12} sm={6}>
          <div className="datepicker-container">
            <label>Дата окончания аренды</label>
            <DatePicker
              selected={formData.endDate}
              onChange={handleEndDateChange}
              selectsEnd
              startDate={formData.startDate}
              endDate={formData.endDate}
              minDate={formData.startDate ? new Date(formData.startDate.getTime() + 24 * 60 * 60 * 1000) : undefined}
              dateFormat="dd.MM.yyyy"
              className="datepicker-input"
              placeholderText="Выберите дату окончания"
            />
          </div>
        </Grid>
        <Grid item xs={12}>
          {formData.startDate && formData.endDate ? (
            <>
              <Typography variant="body2" className="checkout-modal__info">
                Период аренды: с {formatDate(formData.startDate)} по {formatDate(formData.endDate)}
              </Typography>
              <Typography variant="body2" className="checkout-modal__info">
                Количество дней: {rentalDays} {rentalDays === 1 ? 'день' : (rentalDays >= 2 && rentalDays <= 4) ? 'дня' : 'дней'}
              </Typography>
              <Typography variant="body2" className="checkout-modal__info">
                Общая стоимость аренды: {totalRentalCost} ₽
              </Typography>
              <Typography variant="body2" className="checkout-modal__info">
                Залог: {depositAmount} ₽ (возвращается после завершения аренды)
              </Typography>
            </>
          ) : (
            <Typography variant="body2" className="checkout-modal__info">
              Выберите даты для расчета стоимости аренды
            </Typography>
          )}
        </Grid>
      </Grid>
    );
  };

  // Содержимое шага способа оплаты
  const renderPaymentMethodStep = () => (
    <Grid container spacing={3} className="checkout-modal__payment">
      <Grid item xs={12}>
        <Typography variant="h6" className="checkout-modal__subtitle">
          Выберите способ оплаты
        </Typography>
      </Grid>
      <Grid item xs={12}>
        <FormControl component="fieldset">
          <FormLabel component="legend">Доступные способы оплаты</FormLabel>
          <RadioGroup
            aria-label="payment-method"
            name="paymentMethod"
            value={formData.paymentMethod}
            onChange={handlePaymentMethodChange}
          >
            <FormControlLabel 
              value="cash" 
              control={<Radio />} 
              label={
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <AttachMoneyIcon />
                  </Grid>
                  <Grid item>Наличными при получении</Grid>
                </Grid>
            }
            />
            <FormControlLabel 
              value="card" 
              control={<Radio />} 
              label={
                <Grid container alignItems="center" spacing={1}>
                  <Grid item>
                    <CreditCardIcon />
                  </Grid>
                  <Grid item>Картой при получении</Grid>
                </Grid>
              }
            />
          </RadioGroup>
        </FormControl>
      </Grid>
      <Grid item xs={12}>
        <Typography variant="body2" className="checkout-modal__info">
          Оплату необходимо произвести в момент получения оборудования.
        </Typography>
        <Typography variant="body2" className="checkout-modal__info">
          Также при получении необходимо внести залог в размере {(cart.subtotal * 0.5).toFixed(2)} ₽,
          который будет возвращен после завершения аренды и возврата оборудования в исправном состоянии.
        </Typography>
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
  const renderCompletedStep = () => {
    const rentalDays = calculateRentalDays();
    
    return (
    <div className="checkout-modal__completed">
      <CheckCircleOutlineIcon className="checkout-modal__success-icon" />
      <Typography variant="h5" className="checkout-modal__success-title">
        Заказ успешно оформлен
      </Typography>
      <Typography variant="body1" className="checkout-modal__success-text">
          Благодарим за ваш заказ! Вы арендовали оборудование на {rentalDays} {rentalDays === 1 ? 'день' : (rentalDays >= 2 && rentalDays <= 4) ? 'дня' : 'дней'} 
          с {formatDate(formData.startDate)} по {formatDate(formData.endDate)}.
          Оплата будет произведена {formData.paymentMethod === 'cash' ? 'наличными' : 'картой'} при получении.
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
  };

  // Определение содержимого активного шага
  const getStepContent = (step: number) => {
    switch (step) {
      case 0:
        return renderRentalStep();
      case 1:
        return renderPaymentMethodStep();
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