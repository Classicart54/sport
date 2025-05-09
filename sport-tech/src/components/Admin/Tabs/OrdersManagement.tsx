import React, { useState, useEffect, useMemo } from 'react';
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
  DialogContentText,
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
  SelectChangeEvent,
  Grid
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
  Person as PersonIcon,
  ShoppingBag as ShoppingBagIcon
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
  
  // Сортировка заказов от новых к старым
  const sortedOrders = useMemo(() => {
    // Создаем копию массива, чтобы не мутировать исходный
    return [...orders].sort((a, b) => {
      // Преобразуем даты из формата "дд.мм.гггг" в объекты Date для корректного сравнения
      const dateA = a.date.split('.').reverse().join('-');
      const dateB = b.date.split('.').reverse().join('-');
      // Сортируем по убыванию (от новых к старым)
      return new Date(dateB).getTime() - new Date(dateA).getTime();
    });
  }, [orders]);
  
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
    <Box sx={{ width: '100%' }}>
      <Typography 
        variant="h5" 
        sx={{ 
          mb: 3, 
          color: '#1c2536', 
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          gap: 1
        }}
      >
        <ShoppingBagIcon sx={{ color: '#1565c0' }} />
        Управление заказами
      </Typography>
      
      <Paper 
        elevation={0} 
        sx={{ 
          p: 3, 
          mb: 3, 
          borderRadius: '12px',
          border: '1px solid #e5e7eb'
        }}
      >
        <Typography 
          variant="h6" 
          sx={{ 
            mb: 2, 
            color: '#1c2536', 
            fontWeight: 600 
          }}
        >
          Список заказов
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {sortedOrders.length === 0 ? (
          <Box 
            sx={{ 
              textAlign: 'center', 
              py: 5, 
              color: '#6b7280',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2
            }}
          >
            <ShoppingBagIcon sx={{ fontSize: 60, color: '#9ca3af' }} />
            <Typography variant="body1">
            Заказы отсутствуют
          </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ borderRadius: '8px', boxShadow: 'none' }}>
            <Table sx={{ minWidth: 1050 }}>
              <TableHead>
                <TableRow sx={{ 
                  backgroundColor: '#f8fafc', 
                  '& th': { fontWeight: 600, color: '#475569' } 
                }}>
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
                {sortedOrders.map((order) => {
                  const userInfo = getUserInfo(order.userId);
                  return (
                    <TableRow 
                      key={order.id} 
                      sx={{ 
                        '& td': { py: 1.5 },
                        borderBottom: '1px solid #e5e7eb'
                      }}
                    >
                      <TableCell><strong>#{order.id}</strong></TableCell>
                      <TableCell>{formatDate(order.date)}</TableCell>
                      <TableCell>{userInfo.name}</TableCell>
                      <TableCell>{userInfo.email}</TableCell>
                      <TableCell><strong>{order.totalAmount} ₽</strong></TableCell>
                      <TableCell>{order.rentalDays} дн.</TableCell>
                      <TableCell>{formatDate(order.returnDate)}</TableCell>
                      <TableCell>
                        <Chip 
                          label={getStatusLabel(order.status)} 
                          color={getStatusColor(order.status)}
                          size="small"
                          sx={{ 
                            fontWeight: 500,
                            borderRadius: '6px'
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenDetails(order)}
                            sx={{ 
                              color: '#1976d2',
                              bgcolor: 'rgba(25, 118, 210, 0.08)',
                              '&:active': { bgcolor: 'rgba(25, 118, 210, 0.16)' }
                            }}
                          >
                            <VisibilityIcon fontSize="small" />
                          </IconButton>
                          <IconButton 
                            size="small"
                            onClick={() => handleOpenStatusDialog(order)}
                            sx={{ 
                              color: '#9c27b0',
                              bgcolor: 'rgba(156, 39, 176, 0.08)',
                              '&:active': { bgcolor: 'rgba(156, 39, 176, 0.16)' }
                            }}
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
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Детали заказа №{detailsDialog.order?.id}
            </Typography>
            <IconButton 
              onClick={handleCloseDetails} 
              size="small"
              sx={{ 
                bgcolor: '#f1f5f9',
                '&:active': { bgcolor: '#e2e8f0' }
              }}
            >
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {detailsDialog.order && detailsDialog.user && (
            <Stack spacing={3}>
              <Grid container spacing={3}>
                {/* Информация о заказе */}
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      borderRadius: '10px',
                      borderColor: '#e5e7eb'
                    }}
                  >
                  <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <CalendarIcon sx={{ color: '#1565c0' }} />
                      Информация о заказе
                    </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Дата заказа:</strong> {formatDate(detailsDialog.order.date)}
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Статус:</strong>{' '}
                      <Chip 
                        label={getStatusLabel(detailsDialog.order.status)} 
                        color={getStatusColor(detailsDialog.order.status)}
                        size="small"
                            sx={{ borderRadius: '6px', fontWeight: 500 }}
                      />
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Срок аренды:</strong> {detailsDialog.order.rentalDays} дней
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Дата возврата:</strong> {formatDate(detailsDialog.order.returnDate)}
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Сумма заказа:</strong> {detailsDialog.order.totalAmount} ₽
                    </Typography>
                      </Box>
                  </CardContent>
                </Card>
                </Grid>
                
                {/* Информация о клиенте */}
                <Grid item xs={12} md={6}>
                  <Card 
                    variant="outlined" 
                    sx={{ 
                      height: '100%',
                      borderRadius: '10px',
                      borderColor: '#e5e7eb'
                    }}
                  >
                  <CardContent>
                      <Typography 
                        variant="h6" 
                        gutterBottom 
                        sx={{ 
                          fontWeight: 600,
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1
                        }}
                      >
                        <PersonIcon sx={{ color: '#1565c0' }} />
                      Информация о клиенте
                    </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>ФИО:</strong> {detailsDialog.user.firstName} {detailsDialog.user.lastName}
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Email:</strong> {detailsDialog.user.email}
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Телефон:</strong> {detailsDialog.user.phone || 'Не указан'}
                    </Typography>
                        <Typography variant="body2" sx={{ mb: 1 }}>
                      <strong>Город:</strong> {detailsDialog.user.city || 'Не указан'}
                    </Typography>
                      </Box>
                  </CardContent>
                </Card>
                </Grid>
              </Grid>
              
              {/* Товары в заказе */}
              <Card 
                variant="outlined" 
                sx={{ 
                  borderRadius: '10px',
                  borderColor: '#e5e7eb'
                }}
              >
                <CardContent>
                  <Typography 
                    variant="h6" 
                    gutterBottom 
                    sx={{ 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <ShoppingBagIcon sx={{ color: '#1565c0' }} />
                    Товары в заказе
                  </Typography>
                  <TableContainer sx={{ mt: 2 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ 
                          backgroundColor: '#f8fafc',
                          '& th': { fontWeight: 600, color: '#475569' } 
                        }}>
                          <TableCell>Наименование</TableCell>
                          <TableCell align="right">Количество</TableCell>
                          <TableCell align="right">Цена</TableCell>
                          <TableCell align="right">Сумма</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {detailsDialog.order.items.map((item) => (
                          <TableRow key={item.id} sx={{ 
                            '& td': { py: 1.5 },
                            borderBottom: '1px solid #e5e7eb'
                          }}>
                            <TableCell>{item.name}</TableCell>
                            <TableCell align="right">{item.quantity}</TableCell>
                            <TableCell align="right">{item.price} ₽</TableCell>
                            <TableCell align="right">{item.price * item.quantity} ₽</TableCell>
                          </TableRow>
                        ))}
                        <TableRow sx={{ 
                          '& td': { py: 1.5, fontWeight: 600 },
                          backgroundColor: '#f8fafc'
                        }}>
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
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDetails}
            variant="outlined"
            sx={{ borderRadius: '8px', textTransform: 'none', px: 3 }}
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог для изменения статуса заказа */}
      <Dialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
        PaperProps={{
          sx: { borderRadius: '12px' }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Изменить статус заказа
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          <DialogContentText sx={{ mb: 3 }}>
            Выберите новый статус для заказа №{statusDialog.order?.id}
          </DialogContentText>
          <FormControl fullWidth variant="outlined">
            <InputLabel id="status-select-label">Статус</InputLabel>
            <Select
              labelId="status-select-label"
              value={statusDialog.status}
              onChange={handleStatusChange}
              label="Статус"
              sx={{ borderRadius: '8px' }}
            >
              <MenuItem value="active">В аренде</MenuItem>
              <MenuItem value="completed">Завершен</MenuItem>
              <MenuItem value="cancelled">Отменен</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseStatusDialog}
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Отмена
          </Button>
          <Button 
            onClick={handleChangeStatus} 
            variant="contained"
            sx={{ borderRadius: '8px', textTransform: 'none' }}
          >
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      
      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={handleCloseSnackbar}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default OrdersManagement; 