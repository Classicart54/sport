import { FC, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AuthModals.scss';

const LoginModal: FC = () => {
  const { isLoginModalOpen, closeModal, openRegisterModal, login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await login(email, password);
      
      if (success) {
        closeModal();
        setEmail('');
        setPassword('');
        
        // Проверяем, является ли пользователь администратором
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        if (user.isAdmin) {
          // Если пользователь - администратор, перенаправляем на админ-панель
          navigate('/admin');
        }
      } else {
        setError('Неправильный email или пароль');
      }
    } catch (error) {
      setError('Произошла ошибка при входе');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToRegister = () => {
    setEmail('');
    setPassword('');
    setError('');
    openRegisterModal();
  };

  return (
    <Dialog open={isLoginModalOpen} onClose={closeModal} className="auth-modal">
      <DialogTitle className="auth-modal__title">
        Вход в личный кабинет
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent className="auth-modal__content">
          <TextField
            label="Email"
            type="email"
            fullWidth
            margin="normal"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          
          <TextField
            label="Пароль"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          
          {error && (
            <Typography color="error" variant="body2" className="auth-modal__error">
              {error}
            </Typography>
          )}
          
          <Box className="auth-modal__switch">
            <Typography variant="body2">
              У вас нет аккаунта?
            </Typography>
            <Button 
              color="primary" 
              onClick={handleSwitchToRegister}
              className="auth-modal__switch-button"
            >
              Зарегистрироваться
            </Button>
          </Box>
        </DialogContent>
        
        <DialogActions className="auth-modal__actions">
          <Button 
            onClick={closeModal} 
            color="primary"
            className="auth-modal__cancel-button"
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={isLoading}
            className="auth-modal__submit-button"
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default LoginModal; 