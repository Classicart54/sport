import { FC, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button, Box, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import './AuthModals.scss';

const RegisterModal: FC = () => {
  const { isRegisterModalOpen, closeModal, openLoginModal, register } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      setError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (password !== confirmPassword) {
      setError('Пароли не совпадают');
      return;
    }

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }

    setIsLoading(true);
    
    try {
      const success = await register({
        firstName,
        lastName,
        email,
        phone,
        city,
        password
      });
      
      if (success) {
        closeModal();
        // Очищаем форму
        setFirstName('');
        setLastName('');
        setEmail('');
        setPhone('');
        setCity('');
        setPassword('');
        setConfirmPassword('');
      } else {
        setError('Пользователь с таким email уже существует');
      }
    } catch (error) {
      setError('Произошла ошибка при регистрации');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchToLogin = () => {
    // Очищаем форму
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setCity('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    openLoginModal();
  };

  return (
    <Dialog 
      open={isRegisterModalOpen} 
      onClose={closeModal} 
      className="auth-modal"
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle className="auth-modal__title">
        Регистрация
      </DialogTitle>
      
      <form onSubmit={handleSubmit}>
        <DialogContent className="auth-modal__content">
          <Box className="auth-modal__row">
            <TextField
              label="Имя"
              fullWidth
              margin="normal"
              variant="outlined"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
            
            <TextField
              label="Фамилия"
              fullWidth
              margin="normal"
              variant="outlined"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </Box>
          
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
            label="Телефон"
            fullWidth
            margin="normal"
            variant="outlined"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
          
          <TextField
            label="Город"
            fullWidth
            margin="normal"
            variant="outlined"
            value={city}
            onChange={(e) => setCity(e.target.value)}
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
          
          <TextField
            label="Подтверждение пароля"
            type="password"
            fullWidth
            margin="normal"
            variant="outlined"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          
          {error && (
            <Typography color="error" variant="body2" className="auth-modal__error">
              {error}
            </Typography>
          )}
          
          <Box className="auth-modal__switch">
            <Typography variant="body2">
              Уже есть аккаунт?
            </Typography>
            <Button 
              color="primary" 
              onClick={handleSwitchToLogin}
              className="auth-modal__switch-button"
            >
              Войти
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
            {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default RegisterModal; 