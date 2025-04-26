import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Divider,
  Snackbar,
  Alert,
  Stack,
  Card,
  CardContent,
  IconButton,
  SelectChangeEvent
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useOrders, Order, OrderItem } from '../../../context/OrderContext';
import { User } from '../../../types/interfaces';

// Тип данных для отображения информации о пользователе в списке заказов
type UserOrderData = {
  id: number;
  name: string;
  email: string;
};

// Получение статуса заказа для отображения
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'active':
      return 'В аренде';
    case 'completed':
      return 'Завершен';
    case 'cancelled':
      return 'Отменен';
    default:
      return 'Неизвестный статус';
  }
};

// Получение цвета для статуса заказа
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

// Диалоги
type DetailsDialogState = {
  open: boolean;
  order: Order | null;
  user: User | null;
};

type StatusDialogState = {
  open: boolean;
  order: Order | null;
  status: 'active' | 'completed' | 'cancelled';
};

const OrdersManagement: React.FC = () => {
  // Получаем данные о пользователях из контекста авторизации
  const { getAllUsers } = useAuth();
  
  // Используем контекст заказов
  const { orders, updateOrderStatus } = useOrders();
  
  // Состояние для хранения списка пользователей из AuthContext
  const [users, setUsers] = useState<User[]>([]);
  
  // Состояние для модального окна деталей заказа
  const [detailsDialog, setDetailsDialog] = useState<DetailsDialogState>({
    open: false,
    order: null,
    user: null
  });
  
  // Состояние для модального окна изменения статуса
  const [statusDialog, setStatusDialog] = useState<StatusDialogState>({
    open: false,
    order: null,
    status: 'active'
  });
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Загрузка пользователей из AuthContext
  useEffect(() => {
    const allUsers = getAllUsers();
    setUsers(allUsers);
    console.log('Загруженные пользователи:', allUsers);
  }, [getAllUsers]);
  
  // Открытие диалога деталей заказа
  const handleOpenDetails = (order: Order) => {
    const user = users.find(u => u.id === order.userId) || null;
    console.log('Пользователь для заказа:', user);
    setDetailsDialog({
      open: true,
      order,
      user
    });
  };
  
  // Закрытие диалога деталей заказа
  const handleCloseDetails = () => {
    setDetailsDialog({
      open: false,
      order: null,
      user: null
    });
  };
  
  // Открытие диалога изменения статуса
  const handleOpenStatusDialog = (order: Order) => {
    setStatusDialog({
      open: true,
      order,
      status: order.status
    });
  };
  
  // Закрытие диалога изменения статуса
  const handleCloseStatusDialog = () => {
    setStatusDialog({
      open: false,
      order: null,
      status: 'active'
    });
  };
  
  // Изменение статуса заказа
  const handleChangeStatus = () => {
    if (!statusDialog.order || statusDialog.status === statusDialog.order.status) {
      handleCloseStatusDialog();
      return;
    }
    
    // Обновляем статус заказа
    const success = updateOrderStatus(statusDialog.order.id, statusDialog.status);
    
    if (success) {
      setSnackbar({
        open: true,
        message: 'Статус заказа успешно обновлен',
        severity: 'success'
      });
    } else {
      setSnackbar({
        open: true,
        message: 'Не удалось обновить статус заказа',
        severity: 'error'
      });
    }
    
    handleCloseStatusDialog();
  };
  
  // Изменение выбранного статуса в диалоге
  const handleStatusChange = (event: SelectChangeEvent) => {
    setStatusDialog({
      ...statusDialog,
      status: event.target.value as 'active' | 'completed' | 'cancelled'
    });
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Получение информации о пользователе по ID
  const getUserInfo = (userId: number): UserOrderData => {
    const user = users.find(u => u.id === userId);
    
    if (user) {
      return {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email
      };
    }
    
    return {
      id: userId,
      name: 'Неизвестный пользователь',
      email: 'email@unknown.com'
    };
  };
  
  // Форматирование даты в читаемый вид
  const formatDate = (dateString: string) => {
    // Проверяем, что строка даты в формате "дд.мм.гггг"
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('.').map(Number);
      const date = new Date(year, month - 1, day);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    }
    
    // Если другой формат, пытаемся разобрать как новую дату
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      }).format(date);
    } catch (error) {
      console.error('Ошибка форматирования даты:', error);
      return dateString;
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Управление заказами
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Список заказов
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {orders.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            Заказы отсутствуют
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>№ Заказа</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Клиент</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Сумма</TableCell>
                  <TableCell>Срок аренды</TableCell>
                  <TableCell>Дата возврата</TableCell>
                  <TableCell>Статус</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {orders.map((order) => {
                  const userInfo = getUserInfo(order.userId);
                  return (
                    <TableRow key={order.id} hover>
                      <TableCell>{order.id}</TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{userInfo.name}</TableCell>
                      <TableCell>{userInfo.email}</TableCell>
                      <TableCell>{order.totalAmount} ₽</TableCell>
                      <TableCell>{order.rentalDays} дн.</TableCell>
                      <TableCell>{formatDate(order.returnDate)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(order.status)} 
                          color={getStatusColor(order.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenDetails(order)}
                            color="primary"
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            color="secondary"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Диалог для просмотра деталей заказа */}
      <Dialog
        open={detailsDialog.open}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">
              Детали заказа №{detailsDialog.order?.id}
            </Typography>
            <IconButton onClick={handleCloseDetails} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.order && detailsDialog.user && (
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 2 }}>
                {/* Информация о заказе */}
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Информация о заказе
                    </Typography>
                    <Typography variant="body2">
                      <strong>Дата заказа:</strong> {formatDate(detailsDialog.order.date)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Статус:</strong>{' '}
                      <Chip 
                        label={getStatusLabel(detailsDialog.order.status)} 
                        color={getStatusColor(detailsDialog.order.status)}
                        size="small"
                      />
                    </Typography>
                    <Typography variant="body2">
                      <strong>Срок аренды:</strong> {detailsDialog.order.rentalDays} дней
                    </Typography>
                    <Typography variant="body2">
                      <strong>Дата возврата:</strong> {formatDate(detailsDialog.order.returnDate)}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Сумма заказа:</strong> {detailsDialog.order.totalAmount} ₽
                    </Typography>
                  </CardContent>
                </Card>
                
                {/* Информация о клиенте */}
                <Card variant="outlined" sx={{ flex: 1 }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Информация о клиенте
                    </Typography>
                    <Typography variant="body2">
                      <strong>ФИО:</strong> {detailsDialog.user.firstName} {detailsDialog.user.lastName}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Email:</strong> {detailsDialog.user.email}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Телефон:</strong> {detailsDialog.user.phone || 'Не указан'}
                    </Typography>
                    <Typography variant="body2">
                      <strong>Город:</strong> {detailsDialog.user.city || 'Не указан'}
                    </Typography>
                  </CardContent>
                </Card>
              </Box>
              
              {/* Товары в заказе */}
              <Card variant="outlined">
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Товары в заказе
                  </Typography>
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Наименование</TableCell>
                          <TableCell align="right">Количество</TableCell>
                          <TableCell align="right">Цена</TableCell>
                          <TableCell align="right">Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailsDialog.order.items.map((item) => (
                          <TableRow key={item.id}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.price} ₽</TableCell>
                            <TableCell align="right">{item.price * item.quantity} ₽</TableCell>
                          </TableRow>
                        ))}
                        <TableRow>
                          <TableCell colSpan={3} align="right">
                            <strong>Итого:</strong>
                          </TableCell>
                          <TableCell align="right">
                            <strong>{detailsDialog.order.totalAmount} ₽</strong>
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </CardContent>
              </Card>
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDetails}>
            Закрыть
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={() => {
              if (detailsDialog.order) {
                handleOpenStatusDialog(detailsDialog.order);
              }
            }}
          >
            Изменить статус
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог для изменения статуса заказа */}
      <Dialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle>
          Изменение статуса заказа
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel id="status-select-label">Статус заказа</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusDialog.status}
              label="Статус заказа"
              onChange={handleStatusChange}
            >
              <MenuItem value="active">В аренде</MenuItem>
              <MenuItem value="completed">Завершен</MenuItem>
              <MenuItem value="cancelled">Отменен</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>
            Отмена
          </Button>
          <Button 
            variant="contained"
            color="primary"
            onClick={handleChangeStatus}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagement; 