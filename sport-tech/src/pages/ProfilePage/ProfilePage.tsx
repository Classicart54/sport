import React, { useState } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Tabs, 
  Tab, 
  Paper, 
  Avatar, 
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  TextField,
  Stack,
  CircularProgress,
  Snackbar,
  Alert
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useOrders } from '../../context/OrderContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { User } from '../../types/interfaces';
import './ProfilePage.scss';

// Интерфейс для заказа и OrderItem импортируем из OrderContext
import { Order, OrderItem } from '../../context/OrderContext';

// Получение статуса заказа для отображения
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Активен';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    default:
      return status;
  }
};

// Получение цвета чипа для статуса заказа
const getStatusColor = (status: string): "success" | "error" | "default" | "warning" => {
  switch (status) {
    case 'active':
      return 'success';
    case 'completed':
      return 'default';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

const ProfilePage: React.FC = () => {
  const { auth, updateProfile } = useAuth();
  const { getUserOrders } = useOrders(); // Используем контекст заказов
  const [activeTab, setActiveTab] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success'
  });
  
  // Начальные данные пользователя
  const [userData, setUserData] = useState({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
    city: auth.user?.city || ''
  });

  // Обработка смены вкладки
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  // Обработка изменения формы
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Включение режима редактирования
  const handleEditProfile = () => {
    setEditMode(true);
  };

  // Закрытие снекбара
  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Сохранение изменений профиля
  const handleSaveProfile = async () => {
    setIsLoading(true);
    try {
      console.log('Попытка сохранения профиля с данными:', userData);
      console.log('Интерфейс User ожидает поля:', 'firstName, lastName, email, phone, city');
      
      // Прямое приведение к типу, который ожидает updateProfile и соответствует интерфейсу User
      const userDataToUpdate: Omit<User, 'id'> = {
        firstName: userData.firstName,
        lastName: userData.lastName,
        email: userData.email,
        phone: userData.phone || '',
        city: userData.city || '',
        // добавляем все обязательные поля, которые могут быть в интерфейсе User
        // но не включены в форму редактирования
        avatar: auth.user?.avatar
      };
      
      console.log('Подготовленные данные для отправки:', userDataToUpdate);
      
      const success = await updateProfile(userDataToUpdate);
      console.log('Результат обновления профиля:', success);
      
      if (success) {
        setEditMode(false);
        setSnackbar({
          open: true,
          message: 'Профиль успешно обновлен',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'Ошибка при сохранении профиля',
          severity: 'error'
        });
      }
    } catch (error) {
      console.error('Исключение при сохранении профиля:', error);
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при сохранении профиля',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Отмена редактирования
  const handleCancelEdit = () => {
    setUserData({
      firstName: auth.user?.firstName || '',
      lastName: auth.user?.lastName || '',
      email: auth.user?.email || '',
      phone: auth.user?.phone || '',
      city: auth.user?.city || ''
    });
    setEditMode(false);
  };

  // Рендеринг таблицы заказов
  const renderOrdersTab = () => {
    // Получаем заказы текущего пользователя
    const userOrders = auth.user ? getUserOrders(auth.user.id) : [];
    
    return (
      <div className="profile-page__orders">
        <Typography variant="h6" className="profile-page__section-title">
          История заказов
        </Typography>
        
        {userOrders.length === 0 ? (
          <Typography variant="body1" className="profile-page__no-orders">
            У вас пока нет заказов
          </Typography>
        ) : (
          <TableContainer component={Paper} className="profile-page__table-container">
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№ Заказа</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Товары</TableCell>
                  <TableCell>Стоимость</TableCell>
                  <TableCell>Срок аренды</TableCell>
                  <TableCell>Дата возврата</TableCell>
                  <TableCell>Статус</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userOrders.map((order) => (
                  <TableRow key={order.id} className="profile-page__order-row">
                    <TableCell>{order.id}</TableCell>
                    <TableCell>{order.date}</TableCell>
                    <TableCell>
                      <div className="profile-page__order-items">
                        {order.items.map((item) => (
                          <div key={item.id} className="profile-page__order-item">
                            {item.name} x{item.quantity}
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{order.totalAmount} ₽</TableCell>
                    <TableCell>{order.rentalDays} дней</TableCell>
                    <TableCell>{order.returnDate}</TableCell>
                    <TableCell>
                      <Chip 
                        label={getStatusLabel(order.status)} 
                        color={getStatusColor(order.status)}
                        size="small"
                        className="profile-page__status-chip"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </div>
    );
  };

  // Рендеринг вкладки профиля
  const renderProfileTab = () => (
    <div className="profile-page__profile">
      <Typography variant="h6" className="profile-page__section-title">
        Личные данные
      </Typography>
      
      <Paper className="profile-page__profile-card">
        <div className="profile-page__profile-header">
          <Avatar className="profile-page__avatar">
            {userData.firstName.charAt(0)}{userData.lastName.charAt(0)}
          </Avatar>
          
          {!editMode && (
            <Button 
              variant="outlined" 
              startIcon={<EditIcon />}
              onClick={handleEditProfile}
              className="profile-page__edit-button"
            >
              Редактировать
            </Button>
          )}
        </div>
        
        {editMode ? (
          <div className="profile-page__edit-form">
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="firstName"
                  value={userData.firstName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="lastName"
                  value={userData.lastName}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Stack>
              
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleInputChange}
                variant="outlined"
                type="email"
              />
              
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  fullWidth
                  label="Телефон"
                  name="phone"
                  value={userData.phone}
                  onChange={handleInputChange}
                  variant="outlined"
                />
                <TextField
                  fullWidth
                  label="Город"
                  name="city"
                  value={userData.city}
                  onChange={handleInputChange}
                  variant="outlined"
                />
              </Stack>
              
              <Box className="profile-page__action-buttons">
                <Button 
                  variant="outlined" 
                  onClick={handleCancelEdit}
                  className="profile-page__cancel-button"
                  disabled={isLoading}
                >
                  Отмена
                </Button>
                <Button 
                  variant="contained" 
                  onClick={handleSaveProfile}
                  className="profile-page__save-button"
                  disabled={isLoading}
                >
                  {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Сохранить'}
                </Button>
              </Box>
            </Stack>
          </div>
        ) : (
          <div className="profile-page__info">
            <div className="profile-page__info-row">
              <Typography variant="body2" className="profile-page__info-label">
                Имя:
              </Typography>
              <Typography variant="body1" className="profile-page__info-value">
                {userData.firstName} {userData.lastName}
              </Typography>
            </div>
            <div className="profile-page__info-row">
              <Typography variant="body2" className="profile-page__info-label">
                Email:
              </Typography>
              <Typography variant="body1" className="profile-page__info-value">
                {userData.email}
              </Typography>
            </div>
            <div className="profile-page__info-row">
              <Typography variant="body2" className="profile-page__info-label">
                Телефон:
              </Typography>
              <Typography variant="body1" className="profile-page__info-value">
                {userData.phone || 'Не указан'}
              </Typography>
            </div>
            <div className="profile-page__info-row">
              <Typography variant="body2" className="profile-page__info-label">
                Город:
              </Typography>
              <Typography variant="body1" className="profile-page__info-value">
                {userData.city || 'Не указан'}
              </Typography>
            </div>
          </div>
        )}
      </Paper>
    </div>
  );

  return (
    <Container maxWidth="lg" className="profile-page">
      <Box className="profile-page__header">
        <Typography variant="h4" component="h1" className="profile-page__title">
          Личный кабинет
        </Typography>
      </Box>
      
      <Box className="profile-page__content">
        <Paper className="profile-page__tabs-container">
          <Tabs
            value={activeTab}
            onChange={handleTabChange}
            className="profile-page__tabs"
            variant="fullWidth"
          >
            <Tab 
              icon={<AccountCircleIcon />}
              label="Профиль" 
              className="profile-page__tab"
              aria-label="Профиль"
            />
            <Tab 
              icon={<ShoppingBagIcon />}
              label="Мои заказы" 
              className="profile-page__tab" 
              aria-label="Мои заказы"
            />
          </Tabs>
        </Paper>
        
        <Box className="profile-page__tab-content">
          {activeTab === 0 ? renderProfileTab() : renderOrdersTab()}
        </Box>
      </Box>

      {/* Уведомление об успешном обновлении профиля */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default ProfilePage; 