import { FC, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, InputBase, Box, Container, Avatar, Menu, MenuItem, IconButton, Badge } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import PersonIcon from '@mui/icons-material/Person';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import './Header.scss';

const Header: FC = () => {
  const { auth, openLoginModal, openRegisterModal, logout } = useAuth();
  const { cart } = useCart();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const isMenuOpen = Boolean(anchorEl);
  const navigate = useNavigate();
  const location = useLocation();

  // Получаем общее количество товаров в корзине
  const cartItemsCount = cart.items.reduce((count, item) => count + item.quantity, 0);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleMenuClose();
  };

  const goToProfile = () => {
    navigate('/profile');
    handleMenuClose();
  };

  const goToOrders = () => {
    navigate('/profile');
    setAnchorEl(null);
    // Задержка, чтобы сначала прошел переход на страницу профиля, а потом уже открылась вкладка с заказами
    setTimeout(() => {
      const ordersTab = document.querySelector('[aria-label="Мои заказы"]') as HTMLElement;
      if (ordersTab) {
        ordersTab.click();
      }
    }, 100);
  };

  // Обработчик отправки формы поиска
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    
    if (searchQuery.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(''); // Очищаем поле после поиска
    }
  };

  // Функция для плавной прокрутки к элементу
  const scrollToElement = (elementId: string) => {
    // Если мы не на главной странице, сначала перейдем на нее
    if (location.pathname !== '/') {
      navigate('/');
      // Даем время для загрузки страницы перед прокруткой
      setTimeout(() => {
        const element = document.getElementById(elementId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Если мы уже на главной, просто прокручиваем
      const element = document.getElementById(elementId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <AppBar position="static" color="transparent" elevation={0} className="header">
      {/* Верхний уровень хедера */}
      <Container maxWidth={false} className="header__top">
        <Box className="header__location">
          <LocationOnIcon />
          <Typography variant="body2">Новосибирск</Typography>
        </Box>
        
        <Box className="header__nav">
          <Button color="inherit" onClick={() => scrollToElement('hero')}>Главная</Button>
          <Button color="inherit" onClick={() => scrollToElement('catalog')}>Каталог</Button>
          <Button color="inherit" component={Link} to="/contacts">Контакты</Button>
        </Box>
      </Container>
      
      {/* Нижний уровень хедера */}
      <Toolbar className="header__main">
        <Box className="header__logo-container">
          <Link to="/" className="header__logo-link">
            <Typography variant="h6" className="header__logo">
              <span className="header__logo-sport">Sport</span>
              <span className="header__logo-tech">Tech</span>
            </Typography>
          </Link>
        </Box>
        
        <Box className="header__search" component="form" onSubmit={handleSearchSubmit}>
          <SearchIcon className="header__search-icon" />
          <InputBase
            placeholder="Поиск товаров"
            className="header__search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            inputProps={{ 'aria-label': 'поиск' }}
          />
        </Box>
        
        <Box className="header__actions">
          {/* Кнопки авторизации или профиль пользователя */}
          <Box className="header__auth">
            {auth.isAuthenticated && auth.user ? (
              <>
                <Box className="header__user" onClick={handleProfileMenuOpen}>
                  <Avatar className="header__avatar">
                    {auth.user.firstName.charAt(0)}{auth.user.lastName.charAt(0)}
                  </Avatar>
                  <Box className="header__user-info">
                    <Typography variant="body2" className="header__user-name">
                      {auth.user.firstName} {auth.user.lastName}
                    </Typography>
                    <Typography variant="caption" className="header__user-email">
                      {auth.user.email}
                    </Typography>
                  </Box>
                  <IconButton className="header__arrow-button" size="small">
                    <KeyboardArrowDownIcon />
                  </IconButton>
                </Box>
                <Menu
                  anchorEl={anchorEl}
                  open={isMenuOpen}
                  onClose={handleMenuClose}
                  className="header__menu"
                >
                  <MenuItem onClick={goToProfile}>Профиль</MenuItem>
                  <MenuItem onClick={goToOrders}>Мои заказы</MenuItem>
                  <MenuItem onClick={handleLogout}>Выйти</MenuItem>
                </Menu>
              </>
            ) : (
              <>
                <Button 
                  variant="outlined" 
                  className="header__auth-button"
                  onClick={openLoginModal}
                  startIcon={<PersonIcon />}
                >
                  Войти
                </Button>
                <Button 
                  variant="outlined" 
                  className="header__auth-button"
                  onClick={openRegisterModal}
                >
                  Регистрация
                </Button>
              </>
            )}
          </Box>
          
          {/* Иконка корзины */}
          <IconButton
            component={Link}
            to="/cart"
            className="header__cart-button"
          >
            <Badge badgeContent={cartItemsCount} color="error" className="header__cart-badge">
              <ShoppingCartIcon className="header__cart-icon" />
            </Badge>
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Header; 