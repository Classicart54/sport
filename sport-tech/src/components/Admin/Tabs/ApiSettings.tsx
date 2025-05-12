import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper,
  FormControl,
  FormControlLabel,
  RadioGroup,
  Radio,
  Button,
  Divider,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Grid,
  Chip,
  Switch
} from '@mui/material';
import { 
  Api as ApiIcon,
  Storage as StorageIcon,
  Cloud as CloudIcon,
  Sync as SyncIcon
} from '@mui/icons-material';
import { 
  apiService, 
  switchApiMode, 
  getCurrentApiMode, 
  isMockMode, 
  isRealMode 
} from '../../../api';

const ApiSettings: React.FC = () => {
  const [apiMode, setApiMode] = useState(getCurrentApiMode());
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning'
  });
  
  useEffect(() => {
    // Обновляем локальное состояние при монтировании компонента
    setApiMode(getCurrentApiMode());
  }, []);
  
  // Обработчик изменения режима API
  const handleModeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newMode = event.target.value as 'mock' | 'real';
    
    try {
      switchApiMode(newMode);
      setApiMode(newMode);
      setSnackbar({
        open: true,
        message: `Режим API изменен на ${newMode === 'mock' ? 'моковый (имитация)' : 'реальный (сервер)'}`,
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при изменении режима API:', error);
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при изменении режима API',
        severity: 'error'
      });
    }
  };
  
  // Обработчик для синхронизации данных заказов
  const handleSyncOrders = () => {
    try {
      apiService.orders.syncOrdersWithContext();
      setSnackbar({
        open: true,
        message: 'Данные заказов успешно синхронизированы',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при синхронизации данных заказов:', error);
      setSnackbar({
        open: true,
        message: 'Произошла ошибка при синхронизации данных заказов',
        severity: 'error'
      });
    }
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  return (
    <div className="api-settings">
      <Box sx={{ mb: 3 }}>
        <Typography variant="h5" gutterBottom fontWeight={600}>
          <ApiIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
          Настройки API
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Управление режимом работы API и синхронизация данных
        </Typography>
      </Box>
      
      <Grid container spacing={3}>
        {/* Карточка с настройками режима API */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6" fontWeight={600}>
                  Режим работы API
                </Typography>
                <Chip 
                  label={apiMode === 'mock' ? 'Моковый режим' : 'Реальный режим'} 
                  color={apiMode === 'mock' ? 'default' : 'primary'} 
                  size="small" 
                  sx={{ ml: 2 }}
                />
              </Box>
              
              <Alert severity="info" sx={{ mb: 3 }}>
                В моковом режиме данные хранятся в localStorage браузера и не требуют подключения к серверу.
                Реальный режим требует настроенного и работающего бэкенд-сервера.
              </Alert>
              
              <FormControl component="fieldset">
                <RadioGroup 
                  name="api-mode" 
                  value={apiMode} 
                  onChange={handleModeChange}
                >
                  <FormControlLabel 
                    value="mock" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <StorageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                        <span>Моковый режим (имитация)</span>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="real" 
                    control={<Radio />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CloudIcon sx={{ mr: 1, color: 'primary.main' }} />
                        <span>Реальный режим (API сервер)</span>
                      </Box>
                    } 
                  />
                </RadioGroup>
              </FormControl>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Карточка с синхронизацией данных */}
        <Grid item xs={12} md={6}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                Синхронизация данных
              </Typography>
              
              <Alert severity="warning" sx={{ mb: 3 }}>
                Операции синхронизации необходимы только в моковом режиме для обеспечения
                консистентности данных между компонентами приложения.
              </Alert>
              
              <Button 
                variant="outlined" 
                color="primary" 
                startIcon={<SyncIcon />}
                onClick={handleSyncOrders}
                disabled={!isMockMode()}
                fullWidth
                sx={{ mb: 2 }}
              >
                Синхронизировать данные заказов
              </Button>
              
              <Typography variant="body2" color="text.secondary">
                Текущий режим API: <strong>{apiMode === 'mock' ? 'Моковый (имитация)' : 'Реальный (сервер)'}</strong>
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      
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

export default ApiSettings; 