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
  Card,
  CardContent,
  Grid,
  SelectChangeEvent,
  TextField,
  IconButton,
  Tooltip
} from '@mui/material';
import { 
  Visibility as VisibilityIcon,
  Edit as EditIcon,
  CalendarMonth as CalendarIcon,
  ShoppingBag as ShoppingBagIcon,
  Person as PersonIcon,
  LocalShipping as ShippingIcon,
  Search as SearchIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import { useAuth } from '../../../context/AuthContext';
import { useOrder, Order } from '../../../context/OrderContext';

// Получение статуса заказа для отображения
const getStatusLabel = (status: string): string => {
  switch (status) {
    case 'new':
      return 'Новый';
    case 'processing':
      return 'Обрабатывается';
    case 'delivered':
      return 'Доставлен';
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
    case 'new':
      return 'default';
    case 'processing':
      return 'warning';
    case 'delivered':
      return 'success';
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
    if (!dateString) return 'Не указана';
    
    const date = new Date(dateString);
    // Проверка на валидность даты
    if (isNaN(date.getTime())) return 'Дата не указана';
    
    return new Intl.DateTimeFormat('ru-RU', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    }).format(date);
  } catch (error) {
    return 'Дата не указана';
  }
};

// Типы для диалогов
type DetailsDialogState = {
  open: boolean;
  order: Order | null;
};

type StatusDialogState = {
  open: boolean;
  order: Order | null;
  status: Order['status'];
};

const OrdersManagement: React.FC = () => {
  const { auth, getAllUsers } = useAuth();
  const { orders, getAllOrders, updateOrderStatus, getUserOrders, resetOrdersToMock } = useOrder();
  
  // Отладочный вывод для проверки наличия заказов
  useEffect(() => {
    const allOrders = getAllOrders();
    console.log('Все заказы в системе:', allOrders);
  }, [getAllOrders]);
  
  // Состояние для модального окна деталей заказа
  const [detailsDialog, setDetailsDialog] = useState<DetailsDialogState>({
    open: false,
    order: null
  });
  
  // Состояние для модального окна изменения статуса
  const [statusDialog, setStatusDialog] = useState<StatusDialogState>({
    open: false,
    order: null,
    status: 'new'
  });
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Состояние для фильтрации заказов
  const [userIdFilter, setUserIdFilter] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Получаем всех пользователей
  const allUsers = getAllUsers();
  
  // Получаем отфильтрованные заказы
  const filteredOrders = React.useMemo(() => {
    // Сначала получаем все заказы, и только потом фильтруем
    let allOrders = getAllOrders();
    
    // Фильтрация по пользователю
    if (userIdFilter !== null) {
      return getUserOrders(userIdFilter);
    }
    
    // Фильтрация по поисковому запросу
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      allOrders = allOrders.filter(order => 
        order.id.toString().includes(term) || 
        (order.contactInfo?.phone && order.contactInfo.phone.toLowerCase().includes(term)) ||
        (order.contactInfo?.address && order.contactInfo.address.toLowerCase().includes(term)) ||
        order.items.some(item => item.product?.name && item.product.name.toLowerCase().includes(term))
      );
    }
    
    return allOrders;
  }, [getAllOrders, getUserOrders, userIdFilter, searchTerm]);
  
  // Сброс фильтров
  const handleResetFilters = () => {
    setUserIdFilter(null);
    setSearchTerm('');
  };
  
  // Обработчик изменения фильтра пользователя
  const handleUserFilterChange = (event: SelectChangeEvent<string>) => {
    const value = event.target.value;
    setUserIdFilter(value === 'all' ? null : parseInt(value));
  };
  
  // Открытие диалога деталей заказа
  const handleOpenDetails = (order: Order) => {
    setDetailsDialog({
      open: true,
      order
    });
  };
  
  // Закрытие диалога деталей заказа
  const handleCloseDetails = () => {
    setDetailsDialog({
      open: false,
      order: null
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
      status: 'new'
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
      status: event.target.value as Order['status']
    });
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Рендеринг карточки с информацией о заказе
  const renderOrderDetails = (order: Order) => {
    if (!order) return null;
    
    // Вычисляем правильную итоговую сумму
    const calculatedTotal = order.items.reduce((total, item) => {
      return total + (item.product?.price || 0) * (item.quantity || 1) * (item.days || 1);
    }, 0);
    
    return (
      <Box sx={{ p: 1 }}>
        {/* Основная информация о заказе */}
        <Card variant="outlined" sx={{ mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Дата создания:</strong><br /> 
                    {formatDate(order.createdAt)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <CalendarIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="body1">
                    <strong>Дата начала аренды:</strong><br />
                    {formatDate(order.rentalStartDate)}
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} sm={4}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <ShippingIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Box>
                    <Typography variant="body1" component="span">
                      <strong>Статус заказа:</strong><br />
                    </Typography>
                    <Chip 
                      size="small" 
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
        
        {/* Контактная информация */}
        <Card variant="outlined" sx={{ mb: 3, boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <PersonIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="subtitle1" fontWeight={600}>
                Контактная информация
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Телефон:</strong> {order.contactInfo?.phone || '-'}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" gutterBottom>
                  <strong>Способ оплаты:</strong> {order.contactInfo?.paymentMethod === 'cash' ? 'Наличными' : 'Картой'} при получении
                </Typography>
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  <strong>Адрес доставки:</strong> {order.contactInfo?.address || '-'}
                </Typography>
              </Grid>
              {order.contactInfo?.comment && (
                <Grid item xs={12}>
                  <Typography variant="body2">
                    <strong>Комментарий:</strong> {order.contactInfo?.comment}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
        </Card>
            
        {/* Товары в заказе */}
        <Card variant="outlined" sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.08)' }}>
          <CardContent sx={{ px: 3, py: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ShoppingBagIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="subtitle1" fontWeight={600}>
                  Товары в заказе
                </Typography>
              </Box>
              <Box sx={{ bgcolor: '#f5f5f5', p: 1, borderRadius: 1, fontWeight: 'bold' }}>
                Итого: {calculatedTotal > 0 ? calculatedTotal : order.totalAmount} ₽
              </Box>
            </Box>
            
            <TableContainer sx={{ maxHeight: 250 }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f9f9f9' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>Товар</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Количество</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 'bold' }}>Дней аренды</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>Стоимость</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {order.items.length > 0 ? (
                    order.items.map(item => (
                      <TableRow key={item.id}>
                        <TableCell>{item.product?.name || 'Товар не найден'}</TableCell>
                        <TableCell align="center">{item.quantity || 1}</TableCell>
                        <TableCell align="center">{item.days || 1}</TableCell>
                        <TableCell align="right">
                          {(item.product?.price || 0) * (item.quantity || 1) * (item.days || 1)} ₽
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={4} align="center">Нет товаров в заказе</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Box>
    );
  };
  
  // Получаем имя пользователя по ID
  const getUserName = (userId?: number): string => {
    if (!userId) return 'Гость';
    const user = allUsers.find(u => u.id === userId);
    return user ? `${user.firstName} ${user.lastName}` : `Пользователь #${userId}`;
  };
  
  // Обработчик для сброса заказов
  const handleResetToMockData = () => {
    if (window.confirm('Вы уверены, что хотите сбросить все заказы к начальным данным? Это действие нельзя отменить.')) {
      resetOrdersToMock();
      setSnackbar({
        open: true,
        message: 'Заказы успешно сброшены к начальным данным',
        severity: 'success'
      });
    }
  };
  
  return (
    <div className="orders-management">
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <Typography variant="h5" gutterBottom fontWeight={600}>
            Управление заказами
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Просмотр и управление заказами клиентов
          </Typography>
        </div>
        <Button 
          variant="outlined"
          color="warning"
          onClick={handleResetToMockData}
          title="Сбросить все заказы к начальным данным"
        >
          Сбросить данные
        </Button>
      </Box>
      
      {/* Фильтры */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={4}>
            <FormControl fullWidth size="small">
              <InputLabel id="user-filter-label">Пользователь</InputLabel>
              <Select
                labelId="user-filter-label"
                value={userIdFilter === null ? 'all' : userIdFilter.toString()}
                label="Пользователь"
                onChange={handleUserFilterChange}
              >
                <MenuItem value="all">Все пользователи</MenuItem>
                {allUsers.map(user => (
                  <MenuItem key={user.id} value={user.id.toString()}>
                    {user.firstName} {user.lastName}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField 
              label="Поиск по ID, телефону, адресу, товарам" 
              fullWidth
              size="small"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: searchTerm ? (
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <SearchIcon color="action" fontSize="small" />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={2}>
            <Button 
              variant="outlined" 
              fullWidth
              onClick={handleResetFilters}
            >
              Сбросить
            </Button>
          </Grid>
        </Grid>
      </Paper>
      
      {filteredOrders.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6">Нет заказов</Typography>
          <Typography variant="body2" color="text.secondary">
            {userIdFilter !== null 
              ? 'У выбранного пользователя нет заказов' 
              : searchTerm 
                ? 'По вашему запросу ничего не найдено' 
                : 'В данный момент в системе нет заказов'}
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Дата</TableCell>
                <TableCell>Пользователь</TableCell>
                <TableCell>Контакт</TableCell>
                <TableCell>Адрес</TableCell>
                <TableCell>Товары</TableCell>
                <TableCell>Сумма</TableCell>
                <TableCell>Начало аренды</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map(order => (
                <TableRow key={order.id}>
                  <TableCell>#{order.id}</TableCell>
                  <TableCell>{formatDate(order.createdAt)}</TableCell>
                  <TableCell>
                    <Tooltip title={getUserName(order.contactInfo?.userId)}>
                      <Chip 
                        icon={<PersonIcon />} 
                        label={getUserName(order.contactInfo?.userId)}
                        size="small"
                        color={order.contactInfo?.userId ? "primary" : "default"}
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>{order.contactInfo?.phone || '-'}</TableCell>
                  <TableCell>{order.contactInfo?.address || '-'}</TableCell>
                  <TableCell>
                    {order.items.length} {order.items.length === 1 ? 'товар' : 
                    order.items.length < 5 ? 'товара' : 'товаров'}
                  </TableCell>
                  <TableCell>{order.totalAmount} ₽</TableCell>
                  <TableCell>{formatDate(order.rentalStartDate)}</TableCell>
                  <TableCell>
                    <Chip 
                      label={getStatusLabel(order.status)} 
                      color={getStatusColor(order.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<VisibilityIcon />}
                      sx={{ mr: 1, mb: { xs: 1, md: 0 } }}
                      onClick={() => handleOpenDetails(order)}
                    >
                      Детали
                    </Button>
                    <Button
                      variant="outlined"
                      color="primary"
                      size="small"
                      startIcon={<EditIcon />}
                      onClick={() => handleOpenStatusDialog(order)}
                    >
                      Статус
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Диалог с деталями заказа */}
      <Dialog
        open={detailsDialog.open}
        onClose={handleCloseDetails}
        maxWidth="md"
        fullWidth
        PaperProps={{ 
          sx: { 
            borderRadius: '8px',
            overflow: 'hidden'
          } 
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: 'primary.main', 
          color: 'white',
          px: 3,
          py: 2
        }}>
          Детали заказа #{detailsDialog.order?.id || ''}
          {detailsDialog.order?.contactInfo?.userId && (
            <Typography variant="subtitle1" color="white">
              Пользователь: {getUserName(detailsDialog.order.contactInfo.userId)}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent dividers sx={{ p: 3 }}>
          {detailsDialog.order && renderOrderDetails(detailsDialog.order)}
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2 }}>
          <Button 
            onClick={handleCloseDetails} 
            variant="contained"
            color="primary"
          >
            Закрыть
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог изменения статуса заказа */}
      <Dialog
        open={statusDialog.open}
        onClose={handleCloseStatusDialog}
      >
        <DialogTitle>Изменить статус заказа</DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mt: 1 }}>
            <InputLabel>Статус</InputLabel>
            <Select
              value={statusDialog.status}
              label="Статус"
              onChange={handleStatusChange}
            >
              <MenuItem value="new">Новый</MenuItem>
              <MenuItem value="processing">В обработке</MenuItem>
              <MenuItem value="delivered">Доставлен</MenuItem>
              <MenuItem value="completed">Завершен</MenuItem>
              <MenuItem value="cancelled">Отменен</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseStatusDialog}>Отмена</Button>
          <Button onClick={handleChangeStatus} color="primary">
            Сохранить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
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

export default OrdersManagement; 