import { FC, useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { 
  Container, 
  Typography, 
  Box, 
  Grid, 
  Card, 
  CardMedia, 
  CardContent, 
  CircularProgress, 
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  IconButton
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';
import { products as allProducts, categories } from '../../data/mockData';
import { Product } from '../../types/interfaces';
import './SearchPage.scss';

const SearchPage: FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const searchQuery = queryParams.get('query') || '';
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  const [sortOption, setSortOption] = useState<string>('nameAsc');
  const [localSearchQuery, setLocalSearchQuery] = useState<string>(searchQuery);

  // Эффект для поиска товаров при изменении параметров
  useEffect(() => {
    setLoading(true);
    
    // Имитация задержки для демонстрации загрузки
    const timer = setTimeout(() => {
      performSearch();
      setLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedCategory, sortOption]);

  // Функция для выполнения поиска
  const performSearch = () => {
    // Фильтрация по запросу и категории
    let filteredProducts = allProducts.filter(product => {
      // Поиск по названию или описанию
      const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
      const descMatch = product.description 
        ? product.description.toLowerCase().includes(searchQuery.toLowerCase())
        : false;
      
      // Проверка соответствия категории, если выбрана конкретная категория
      const categoryMatch = selectedCategory === 'all' || product.categoryId === selectedCategory;
      
      return (nameMatch || descMatch) && categoryMatch;
    });
    
    // Сортировка результатов
    filteredProducts = sortProducts(filteredProducts, sortOption);
    
    setSearchResults(filteredProducts);
  };
  
  // Функция для сортировки результатов
  const sortProducts = (products: Product[], option: string): Product[] => {
    switch (option) {
      case 'nameAsc':
        return [...products].sort((a, b) => a.name.localeCompare(b.name));
      case 'nameDesc':
        return [...products].sort((a, b) => b.name.localeCompare(a.name));
      case 'priceAsc':
        return [...products].sort((a, b) => a.price - b.price);
      case 'priceDesc':
        return [...products].sort((a, b) => b.price - a.price);
      default:
        return products;
    }
  };

  // Обработчик изменения категории
  const handleCategoryChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newCategory = event.target.value as number | 'all';
    setSelectedCategory(newCategory);
  };
  
  // Обработчик изменения сортировки
  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const newSortOption = event.target.value as string;
    setSortOption(newSortOption);
  };
  
  // Обработчик отправки формы поиска
  const handleSearchSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    navigate(`/search?query=${encodeURIComponent(localSearchQuery)}`);
  };

  return (
    <Container maxWidth="lg" className="search-page">
      <Box className="search-page__header">
        <Typography variant="h4" component="h1" className="search-page__title">
          {searchQuery ? `Результаты поиска: ${searchQuery}` : 'Все товары'}
        </Typography>
        
        {/* Форма для поиска на странице */}
        <Box component="form" onSubmit={handleSearchSubmit} className="search-page__search-form">
          <TextField
            variant="outlined"
            placeholder="Поиск товаров"
            value={localSearchQuery}
            onChange={(e) => setLocalSearchQuery(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton type="submit" edge="end">
                    <SearchIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            fullWidth
          />
        </Box>
      </Box>
      
      <Box className="search-page__filters">
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Категория</InputLabel>
              <Select
                value={selectedCategory}
                onChange={handleCategoryChange}
                label="Категория"
              >
                <MenuItem value="all">Все категории</MenuItem>
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth variant="outlined">
              <InputLabel>Сортировать</InputLabel>
              <Select
                value={sortOption}
                onChange={handleSortChange}
                label="Сортировать"
              >
                <MenuItem value="nameAsc">По названию (А-Я)</MenuItem>
                <MenuItem value="nameDesc">По названию (Я-А)</MenuItem>
                <MenuItem value="priceAsc">По цене (сначала дешевле)</MenuItem>
                <MenuItem value="priceDesc">По цене (сначала дороже)</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} sm={12} md={4}>
            <Box className="search-page__results-count">
              <Typography variant="body1">
                {loading ? 'Поиск...' : `Найдено товаров: ${searchResults.length}`}
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Box>
      
      {loading ? (
        <Box className="search-page__loading">
          <CircularProgress />
        </Box>
      ) : searchResults.length > 0 ? (
        <Grid container spacing={3} className="search-page__results">
          {searchResults.map((product) => {
            const category = categories.find(c => c.id === product.categoryId);
            
            return (
              <Grid item xs={12} sm={6} md={4} key={product.id}>
                <Card className="search-page__product-card">
                  <Link to={`/product/${product.id}`} className="search-page__product-link">
                    <CardMedia
                      component="img"
                      image={product.image}
                      alt={product.name}
                      className="search-page__product-image"
                    />
                    <CardContent className="search-page__product-content">
                      <Typography variant="body2" color="textSecondary" className="search-page__product-category">
                        {category?.title}
                      </Typography>
                      <Typography variant="h6" component="h2" className="search-page__product-name">
                        {product.name}
                      </Typography>
                      <Typography variant="body1" className="search-page__product-price">
                        От {product.price} ₽ в день
                      </Typography>
                    </CardContent>
                  </Link>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      ) : (
        <Box className="search-page__no-results">
          <Typography variant="h6">
            К сожалению, по вашему запросу ничего не найдено.
          </Typography>
          <Typography variant="body1" sx={{ mt: 1, mb: 3 }}>
            Попробуйте изменить параметры поиска или выбрать другую категорию.
          </Typography>
          <Button variant="contained" component={Link} to="/">
            Вернуться на главную
          </Button>
        </Box>
      )}
    </Container>
  );
};

export default SearchPage; 