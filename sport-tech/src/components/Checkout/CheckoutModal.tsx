import React, { useState, useEffect } from 'react';
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
  FormLabel,
  Paper,
  Box
} from '@mui/material';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrdersContext';
import CloseIcon from '@mui/icons-material/Close';
import DateRangeIcon from '@mui/icons-material/DateRange';
import PaymentIcon from '@mui/icons-material/Payment';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PersonIcon from '@mui/icons-material/Person';
import PhoneIcon from '@mui/icons-material/Phone';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import HomeIcon from '@mui/icons-material/Home';
import MarkunreadMailboxIcon from '@mui/icons-material/MarkunreadMailbox';

// Импортируем компоненты react-datepicker
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { registerLocale } from 'react-datepicker';
import ru from 'date-fns/locale/ru';

// Регистрируем русскую локаль
registerLocale('ru', ru);

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

  // Заполняем данные из профиля пользователя при открытии модального окна
  useEffect(() => {
    if (open && auth.isAuthenticated && auth.user) {
      setFormData(prev => ({
        ...prev,
        fullName: `${auth.user?.firstName || ''} ${auth.user?.lastName || ''}`.trim(),
        phone: auth.user?.phone || '',
        city: auth.user?.city || ''
      }));
    }
  }, [open, auth.isAuthenticated, auth.user]);

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
        totalAmount: cart.subtotal,
        status: 'active',
        rentalDays: rentalDays,
        returnDate: returnDateString,
        contactInfo: {
          fullName: formData.fullName,
          phone: formData.phone,
          address: `${formData.city}, ${formData.address}`,
          postalCode: formData.postalCode,
          paymentMethod: formData.paymentMethod
        }
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

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="md"
      fullWidth
      className="checkout-modal"
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">Оформление заказа</Typography>
          <IconButton onClick={handleCloseModal} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent className="checkout-modal__content">
        {!completed ? (
          <>
            <Stepper activeStep={activeStep} className="checkout-modal__stepper">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel 
                    StepIconProps={{
                      icon: index === 0 ? <DateRangeIcon /> : 
                            index === 1 ? <PaymentIcon /> : 
                            <LocalShippingIcon />
                    }}
                  >
                    {label}
                  </StepLabel>
                </Step>
              ))}
            </Stepper>

            <Box className="checkout-modal__step-content">
              {activeStep === 0 && (
                <Box className="checkout-modal__form-section">
                  <Typography variant="h6" className="checkout-modal__section-title">
                    <DateRangeIcon /> Выберите даты аренды
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        selected={formData.startDate}
                        onChange={handleStartDateChange}
                        selectsStart
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        minDate={today}
                        className="datepicker-input"
                        placeholderText="Выберите дату начала"
                        locale="ru"
                        customInput={
                          <TextField 
                            fullWidth 
                            variant="outlined"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DateRangeIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        }
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <DatePicker
                        selected={formData.endDate}
                        onChange={handleEndDateChange}
                        selectsEnd
                        startDate={formData.startDate}
                        endDate={formData.endDate}
                        minDate={formData.startDate ? new Date(formData.startDate.getTime() + 24 * 60 * 60 * 1000) : undefined}
                        className="datepicker-input"
                        placeholderText="Выберите дату окончания"
                        locale="ru"
                        customInput={
                          <TextField 
                            fullWidth 
                            variant="outlined"
                            InputProps={{
                              endAdornment: (
                                <InputAdornment position="end">
                                  <DateRangeIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>
              )}

              {activeStep === 1 && (
                <Box className="checkout-modal__form-section">
                  <Typography variant="h6" className="checkout-modal__section-title">
                    <PaymentIcon /> Способ оплаты
                  </Typography>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onChange={handlePaymentMethodChange}
                    className="checkout-modal__payment-options"
                  >
                    <FormControlLabel
                      value="cash"
                      control={<Radio />}
                      label={
                        <div className="checkout-modal__payment-option">
                          <AttachMoneyIcon className="checkout-modal__payment-icon" />
                          <div className="checkout-modal__payment-info">
                            <Typography variant="body1" className="checkout-modal__payment-title">
                              Наличными при получении
                            </Typography>
                            <Typography variant="body2" className="checkout-modal__payment-description">
                              Оплата наличными при получении товара
                            </Typography>
                          </div>
                        </div>
                      }
                    />
                    <FormControlLabel
                      value="card"
                      control={<Radio />}
                      label={
                        <div className="checkout-modal__payment-option">
                          <CreditCardIcon className="checkout-modal__payment-icon" />
                          <div className="checkout-modal__payment-info">
                            <Typography variant="body1" className="checkout-modal__payment-title">
                              Картой при получении
                            </Typography>
                            <Typography variant="body2" className="checkout-modal__payment-description">
                              Оплата картой при получении товара
                            </Typography>
                          </div>
                        </div>
                      }
                    />
                  </RadioGroup>
                </Box>
              )}

              {activeStep === 2 && (
                <Box className="checkout-modal__form-section">
                  <Typography variant="h6" className="checkout-modal__section-title">
                    <LocalShippingIcon /> Информация о доставке
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Имя"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PersonIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Телефон"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <PhoneIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Город"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <LocationCityIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <TextField
                        fullWidth
                        label="Адрес"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <HomeIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="Почтовый индекс"
                        name="postalCode"
                        value={formData.postalCode}
                        onChange={handleChange}
                        variant="outlined"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <MarkunreadMailboxIcon fontSize="small" />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Grid>
                  </Grid>

                  <Paper elevation={0} className="checkout-modal__delivery-info">
                    <Typography variant="subtitle2" className="checkout-modal__delivery-info-title">
                      <LocalShippingIcon className="checkout-modal__delivery-icon" />
                      Информация о доставке
                    </Typography>
                    <Typography variant="body2" className="checkout-modal__delivery-details">
                      Доставка осуществляется в течение 1-2 рабочих дней после оформления заказа.
                      Стоимость доставки включена в итоговую сумму заказа.
                    </Typography>
                  </Paper>
                </Box>
              )}
            </Box>

            <Box className="checkout-modal__actions">
              <Button
                onClick={handleBack}
                disabled={activeStep === 0}
                variant="outlined"
              >
                Назад
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={activeStep === steps.length - 1 ? handleSubmit : handleNext}
              >
                {activeStep === steps.length - 1 ? 'Оформить заказ' : 'Далее'}
              </Button>
            </Box>
          </>
        ) : (
          <Box className="checkout-modal__completed">
            <CheckCircleOutlineIcon className="checkout-modal__success-icon" />
            <Typography variant="h5" className="checkout-modal__success-title">
              Заказ успешно оформлен
            </Typography>
            <Typography variant="body1" className="checkout-modal__success-message">
              Спасибо за ваш заказ! Мы свяжемся с вами в ближайшее время для подтверждения.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCloseModal}
              size="large"
            >
              Закрыть
            </Button>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CheckoutModal; 