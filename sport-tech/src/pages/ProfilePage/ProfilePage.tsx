import React, { useState, useEffect } from 'react';
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
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Divider,
  List,
  ListItem
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useOrders, OrderData } from '../../context/OrdersContext';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import CancelIcon from '@mui/icons-material/Cancel';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { User } from '../../types/interfaces';
import './ProfilePage.scss';
import { useLocation } from 'react-router-dom';

// Получение статуса заказа для отображения
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'Активный';
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
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'error';
    default:
      return 'default';
  }
};

// Форматирование даты
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Некорректная дата';
  }
};

const ProfilePage: React.FC = () => {
  const { auth, updateProfile } = useAuth();
  const { userOrders, updateOrderStatus } = useOrders();
  const [activeTab, setActiveTab] = useState(0);
  const location = useLocation();
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
  
  // Состояние для диалога подтверждения отмены заказа
  const [cancelDialog, setCancelDialog] = useState<{
    open: boolean;
    orderId: number | null;
  }>({
    open: false,
    orderId: null
  });
  
  // Состояние для диалога деталей заказа
  const [orderDetailsDialog, setOrderDetailsDialog] = useState<{
    open: boolean;
    order: OrderData | null;
  }>({
    open: false,
    order: null
  });
  
  // Начальные данные пользователя
  const [userData, setUserData] = useState({
    firstName: auth.user?.firstName || '',
    lastName: auth.user?.lastName || '',
    email: auth.user?.email || '',
    phone: auth.user?.phone || '',
    city: auth.user?.city || ''
  });

  // Обработка параметра tab из URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab === 'orders') {
      setActiveTab(1);
    }
  }, [location]);

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

  // Открытие диалога подтверждения отмены заказа
  const handleOpenCancelDialog = (orderId: number) => {
    setCancelDialog({
      open: true,
      orderId
    });
  };

  // Закрытие диалога подтверждения отмены заказа
  const handleCloseCancelDialog = () => {
    setCancelDialog({
      open: false,
      orderId: null
    });
  };

  // Отмена заказа
  const handleCancelOrder = () => {
    if (cancelDialog.orderId === null) {
      handleCloseCancelDialog();
      return;
    }

    const success = updateOrderStatus(cancelDialog.orderId, 'cancelled');

    if (success) {
      setSnackbar({
        open: true,
        message: 'Заказ успешно отменен',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Не удалось отменить заказ',
        severity: 'error'
      });
    }

    handleCloseCancelDialog();
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
      
      const success = await updateProfile(userDataToUpdate);
      
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

  // Открытие диалога деталей заказа
  const handleOpenOrderDetails = (order: OrderData) => {
    setOrderDetailsDialog({ open: true, order });
  };

  // Закрытие диалога деталей заказа
  const handleCloseOrderDetails = () => {
    setOrderDetailsDialog({ open: false, order: null });
  };

  // Рендеринг таблицы заказов
  const renderOrdersTab = () => {
    // Используем заказы из нового контекста
    if (!userOrders || userOrders.length === 0) {
      return (
        <Box sx={{ textAlign: 'center', p: 3 }}>
          <Typography variant="body1" color="textSecondary">
            У вас пока нет заказов
          </Typography>
        </Box>
      );
    }

    return (
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 900 }} aria-label="таблица заказов">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: '10%' }}>№ заказа</TableCell>
              <TableCell sx={{ width: '30%' }}>Товары</TableCell>
              <TableCell sx={{ width: '15%' }}>Дата оформления</TableCell>
              <TableCell sx={{ width: '15%' }}>Дата возврата</TableCell>
              <TableCell sx={{ width: '10%' }}>Сумма</TableCell>
              <TableCell sx={{ width: '10%' }}>Статус</TableCell>
              <TableCell align="center" sx={{ width: '10%' }}>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {userOrders.map((order) => (
              <TableRow key={order.id}>
                <TableCell component="th" scope="row">#{order.id}</TableCell>
                <TableCell>
                  <Typography variant="body2" noWrap title={order.items.map(item => `${item.name} (x${item.quantity})`).join(', ')}>
                    {order.items.slice(0, 2).map(item => `${item.name} (x${item.quantity})`).join(', ')}
                    {order.items.length > 2 ? ', ...' : ''}
                  </Typography>
                </TableCell>
                <TableCell>{formatDate(order.createdAt)}</TableCell>
                <TableCell>{order.returnDate}</TableCell>
                <TableCell>{order.totalAmount.toFixed(2)} ₽</TableCell>
                <TableCell>
                  <Chip 
                    label={getStatusLabel(order.status)} 
                    color={getStatusColor(order.status)} 
                    size="small" 
                  />
                </TableCell>
                <TableCell align="center"> 
                  <IconButton 
                    size="small" 
                    color="primary"
                    onClick={() => handleOpenOrderDetails(order)}
                    sx={{ mr: 0.5 }}
                    title="Просмотр деталей"
                  >
                    <VisibilityIcon fontSize="small" />
                  </IconButton>
                  {order.status === 'active' && (
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleOpenCancelDialog(order.id)}
                      title="Отменить заказ"
                    >
                      <CancelIcon fontSize="small" />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  // Рендеринг вкладки профиля
  const renderProfileTab = () => (
    <div className="profile-page__profile">
      <div className="profile-page__avatar-section">
        <Avatar className="profile-page__avatar">
          {auth.user?.firstName?.[0] || 'U'}
        </Avatar>
        <Typography variant="h6" className="profile-page__username">
          {`${auth.user?.firstName || ''} ${auth.user?.lastName || ''}`}
        </Typography>
        <Typography variant="body2" className="profile-page__email">
          {auth.user?.email || ''}
        </Typography>
      </div>

      <Paper className="profile-page__info-section">
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6">
            Информация пользователя
          </Typography>
          {!editMode && (
            <Button 
              startIcon={<EditIcon />} 
              onClick={handleEditProfile}
            >
              Редактировать
            </Button>
          )}
        </Box>

        <form noValidate>
          <Stack spacing={2}>
            <TextField
              label="Имя"
              name="firstName"
              value={userData.firstName}
              onChange={handleInputChange}
              fullWidth
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
            <TextField
              label="Фамилия"
              name="lastName"
              value={userData.lastName}
              onChange={handleInputChange}
              fullWidth
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={userData.email}
              onChange={handleInputChange}
              fullWidth
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
            <TextField
              label="Телефон"
              name="phone"
              value={userData.phone}
              onChange={handleInputChange}
              fullWidth
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
            <TextField
              label="Город"
              name="city"
              value={userData.city}
              onChange={handleInputChange}
              fullWidth
              disabled={!editMode}
              variant={editMode ? "outlined" : "filled"}
            />
          </Stack>

          {editMode && (
            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button 
                variant="outlined" 
                onClick={handleCancelEdit}
                disabled={isLoading}
              >
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleSaveProfile}
                disabled={isLoading}
                startIcon={isLoading ? <CircularProgress size={20} /> : null}
              >
                Сохранить
              </Button>
            </Box>
          )}
        </form>
      </Paper>
    </div>
  );

  return (
    <div className="profile-page">
      <Container>
        <Paper className="profile-page__paper">
          <Tabs 
            value={activeTab} 
            onChange={handleTabChange}
            variant="fullWidth"
            className="profile-page__tabs"
          >
            <Tab label="Профиль" icon={<AccountCircleIcon />} />
            <Tab label="Заказы" icon={<ShoppingBagIcon />} />
          </Tabs>

          <Box className="profile-page__content">
            {activeTab === 0 && renderProfileTab()}
            {activeTab === 1 && renderOrdersTab()}
          </Box>
        </Paper>
      </Container>

      {/* Диалог подтверждения отмены заказа */}
      <Dialog
        open={cancelDialog.open}
        onClose={handleCloseCancelDialog}
      >
        <DialogTitle>Отмена заказа</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы уверены, что хотите отменить заказ #{cancelDialog.orderId}?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseCancelDialog}>Отмена</Button>
          <Button onClick={handleCancelOrder} color="error" autoFocus>
            Отменить заказ
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог деталей заказа */}
      <Dialog
        open={orderDetailsDialog.open}
        onClose={handleCloseOrderDetails}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ pb: 1 }}>
          Детали заказа #{orderDetailsDialog.order?.id}
        </DialogTitle>
        <DialogContent sx={{ pt: 1 }}>
          {orderDetailsDialog.order && (
            <Box>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Оформлен: {formatDate(orderDetailsDialog.order.createdAt)}
              </Typography>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>Товары:</Typography>
              <List dense sx={{ mb: 1.5, pl: 1 }}>
                {orderDetailsDialog.order.items.map(item => (
                  <ListItem key={item.id} disablePadding sx={{ mb: 0.5 }}>
                    <Typography variant="body2" sx={{ flexGrow: 1 }}>
                      {item.name} (x{item.quantity})
                    </Typography>
                    <Typography variant="body2" sx={{ ml: 1 }}>
                      {(item.price * item.quantity).toFixed(2)} ₽
                    </Typography>
                  </ListItem>
                ))}
              </List>
              <Divider sx={{ my: 1.5 }} />
              <Typography variant="body2"><b>Период аренды:</b> {orderDetailsDialog.order.rentalDays} {orderDetailsDialog.order.rentalDays === 1 ? 'день' : 'дней'}</Typography>
              <Typography variant="body2"><b>Дата возврата:</b> {orderDetailsDialog.order.returnDate}</Typography>
              <Typography variant="body2"><b>Способ оплаты:</b> {orderDetailsDialog.order.contactInfo?.paymentMethod === 'cash' ? 'Наличными' : 'Картой'} при получении</Typography>
              <Typography variant="body2"><b>Адрес доставки:</b> {orderDetailsDialog.order.contactInfo?.address}</Typography>
              <Typography variant="body1" sx={{ mt: 2, fontWeight: 'bold', textAlign: 'right' }}>
                Итого: {orderDetailsDialog.order.totalAmount.toFixed(2)} ₽
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseOrderDetails}>Закрыть</Button>
        </DialogActions>
      </Dialog>

      {/* Снекбар для уведомлений */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default ProfilePage; 