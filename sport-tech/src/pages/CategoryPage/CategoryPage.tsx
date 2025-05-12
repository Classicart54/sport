import { FC, useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Checkbox, 
  FormGroup, 
  FormControlLabel, 
  Slider, 
  Paper, 
  Divider, 
  IconButton,
  TextField,
  InputAdornment,
  RadioGroup,
  Radio,
  Chip
} from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FilterListIcon from '@mui/icons-material/FilterList';
import TuneIcon from '@mui/icons-material/Tune';
import CloseIcon from '@mui/icons-material/Close';
import SortIcon from '@mui/icons-material/Sort';
import AcUnitIcon from '@mui/icons-material/AcUnit';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import SportsTennisIcon from '@mui/icons-material/SportsTennis';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import ProductCard from '../../components/ProductCard/ProductCard';
import { categories, products } from '../../data/mockData';
import { Product, Category } from '../../types/interfaces';
import './CategoryPage.scss';

interface CategoryPageProps {}

// Интерфейс для фильтров
interface Filters {
  priceRange: [number, number];
  availability: boolean;
  newArrivals: boolean;
  popular: boolean;
  promotion: boolean;
  sortBy: string;
  season: string;
  equipmentType: string[];
}

const CategoryPage: FC<CategoryPageProps> = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const [categoryProducts, setCategoryProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [filtersOpen, setFiltersOpen] = useState<boolean>(false);
  const navigate = useNavigate();
  
  // Находим минимальную и максимальную цену среди всех товаров
  const [minPrice, setMinPrice] = useState<number>(0);
  const [maxPrice, setMaxPrice] = useState<number>(1000);
  
  // Состояние для фильтров
  const [filters, setFilters] = useState<Filters>({
    priceRange: [0, 1000],
    availability: false,
    newArrivals: false,
    popular: false,
    promotion: false,
    sortBy: 'default',
    season: 'all',
    equipmentType: []
  });
  
  useEffect(() => {
    if (categoryId) {
      // Находим категорию по ID
      const foundCategory = categories.find(cat => cat.id === parseInt(categoryId));
      setCategory(foundCategory || null);
      
      // Фильтруем товары по ID категории
      const foundProducts = products.filter(product => product.categoryId === parseInt(categoryId));
      setCategoryProducts(foundProducts);
      
      // Вычисляем мин. и макс. цену для слайдера
      if (foundProducts.length > 0) {
        const prices = foundProducts.map(p => p.price);
        const min = Math.floor(Math.min(...prices));
        const max = Math.ceil(Math.max(...prices));
        setMinPrice(min);
        setMaxPrice(max);
        setFilters(prev => ({
          ...prev,
          priceRange: [min, max]
        }));
      }
      
      // Прокрутка страницы вверх
      window.scrollTo(0, 0);
    }
  }, [categoryId]);
  
  // Применяем фильтры к товарам
  useEffect(() => {
    if (categoryProducts.length > 0) {
      let result = [...categoryProducts];
      
      // Фильтр по цене
      result = result.filter(product => 
        product.price >= filters.priceRange[0] && 
        product.price <= filters.priceRange[1]
      );
      
      // Для имитации: здесь мы просто делаем случайную выборку для других фильтров,
      // в реальном приложении здесь была бы логика фильтрации по реальным свойствам
      
      // Фильтр по доступности
      if (filters.availability) {
        // Имитация: предполагаем, что 70% товаров доступны
        result = result.filter(product => product.id % 10 < 7);
      }
      
      // Фильтр по новинкам
      if (filters.newArrivals) {
        // Имитация: предполагаем, что товары с id > 15 - новые
        result = result.filter(product => product.id > 15);
      }
      
      // Фильтр по популярности
      if (filters.popular) {
        // Имитация: предполагаем, что популярны товары с нечетным id
        result = result.filter(product => product.id % 2 === 1);
      }
      
      // Фильтр по акциям
      if (filters.promotion) {
        // Имитация: предполагаем, что товары с id, делящимся на 3, имеют акцию
        result = result.filter(product => product.id % 3 === 0);
      }
      
      // Фильтр по сезону
      if (filters.season !== 'all') {
        // Имитация: 
        // - 'summer' - товары с четным id
        // - 'winter' - товары с нечетным id
        if (filters.season === 'summer') {
          result = result.filter(product => product.id % 2 === 0);
        } else if (filters.season === 'winter') {
          result = result.filter(product => product.id % 2 === 1);
        }
      }
      
      // Фильтр по типу оборудования
      if (filters.equipmentType.length > 0) {
        // Имитация: фильтрация по остатку от деления id на 4
        // 'cardio' - остаток 0, 'strength' - остаток 1, 'flexibility' - остаток 2, 'recovery' - остаток 3
        result = result.filter(product => {
          const remainder = product.id % 4;
          return (
            (filters.equipmentType.includes('cardio') && remainder === 0) ||
            (filters.equipmentType.includes('strength') && remainder === 1) ||
            (filters.equipmentType.includes('flexibility') && remainder === 2) ||
            (filters.equipmentType.includes('recovery') && remainder === 3)
          );
        });
      }
      
      // Сортировка
      switch (filters.sortBy) {
        case 'priceAsc':
          result.sort((a, b) => a.price - b.price);
          break;
        case 'priceDesc':
          result.sort((a, b) => b.price - a.price);
          break;
        case 'nameAsc':
          result.sort((a, b) => a.name.localeCompare(b.name));
          break;
        case 'nameDesc':
          result.sort((a, b) => b.name.localeCompare(a.name));
          break;
        default:
          // По умолчанию не сортируем
          break;
      }
      
      setFilteredProducts(result);
    }
  }, [categoryProducts, filters]);

  const handleGoBack = () => {
    navigate('/');
  };
  
  // Обработчики изменения фильтров
  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setFilters(prev => ({
      ...prev,
      priceRange: newValue as [number, number]
    }));
  };
  
  const handleCheckboxChange = (filterName: keyof Filters) => (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: event.target.checked
    }));
  };
  
  const handleSortChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setFilters(prev => ({
      ...prev,
      sortBy: event.target.value as string
    }));
  };
  
  const handleSeasonChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({
      ...prev,
      season: event.target.value
    }));
  };
  
  const handleEquipmentTypeChange = (type: string) => {
    setFilters(prev => {
      const currentTypes = [...prev.equipmentType];
      if (currentTypes.includes(type)) {
        return {
          ...prev,
          equipmentType: currentTypes.filter(t => t !== type)
        };
      } else {
        return {
          ...prev,
          equipmentType: [...currentTypes, type]
        };
      }
    });
  };
  
  const handleFilterReset = () => {
    setFilters({
      priceRange: [minPrice, maxPrice],
      availability: false,
      newArrivals: false,
      popular: false,
      promotion: false,
      sortBy: 'default',
      season: 'all',
      equipmentType: []
    });
  };
  
  const toggleFilters = () => {
    setFiltersOpen(!filtersOpen);
  };

  if (!category) {
    return <div>Загрузка...</div>;
  }

  return (
    <Box className="category-page">
      <Box className="category-banner" style={{ backgroundImage: `url(${category.image})` }}>
        <Container maxWidth={false}>
          <Box className="category-banner__content">
            <Box className="category-banner__badge">
              <BoltIcon fontSize="small" />
              <Typography variant="body2">{filteredProducts.length} товаров в наличии</Typography>
            </Box>
            <Typography variant="h1" className="category-banner__title">
              {category.title}
            </Typography>
          </Box>
        </Container>
      </Box>
      
      <Container maxWidth={false} className="category-page__container">
        <Button 
          className="category-page__back-button"
          startIcon={<ArrowBackIcon />} 
          onClick={handleGoBack}
        >
          На главную
        </Button>
        
        {/* Мобильная кнопка открытия фильтров */}
        <Box className="category-page__mobile-filter-button" sx={{ display: { xs: 'block', sm: 'none' }, mb: 2 }}>
          <Button 
            variant="outlined"
            fullWidth
            startIcon={<FilterListIcon />}
            onClick={toggleFilters}
          >
            Фильтры
          </Button>
        </Box>
        
        <Box sx={{ display: 'flex', flexDirection: { xs: filtersOpen ? 'row' : 'row-reverse', sm: 'row' }, gap: 3 }}>
          {/* Боковая панель фильтров */}
          <Box className="category-page__sidebar" sx={{ 
            width: { xs: '240px', md: '260px', lg: '250px' }, 
            flexShrink: 0,
            display: { xs: filtersOpen ? 'block' : 'none', sm: 'block' } 
          }}>
            <Paper elevation={0} className="category-page__filters">
              <Box className="category-page__filters-header">
                <Typography variant="h6" className="category-page__filters-title">
                  <FilterListIcon /> Фильтры
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button 
                    variant="text" 
                    size="small" 
                    onClick={handleFilterReset}
                  >
                    Сбросить
                  </Button>
                  {/* Кнопка закрытия на мобильных */}
                  <IconButton 
                    size="small" 
                    onClick={toggleFilters}
                    sx={{ display: { xs: 'flex', sm: 'none' } }}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
              
              <Divider />
              
              <Box className="category-page__filter-section">
                <Typography variant="subtitle2" gutterBottom>
                  Цена (₽ в день)
                </Typography>
                <Box className="category-page__price-inputs">
                  <TextField
                    variant="outlined"
                    size="small"
                    label="От"
                    type="number"
                    value={filters.priceRange[0]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value >= minPrice) {
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [value, prev.priceRange[1]]
                        }));
                      }
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                    }}
                  />
                  <TextField
                    variant="outlined"
                    size="small"
                    label="До"
                    type="number"
                    value={filters.priceRange[1]}
                    onChange={(e) => {
                      const value = parseInt(e.target.value);
                      if (!isNaN(value) && value <= maxPrice) {
                        setFilters(prev => ({
                          ...prev,
                          priceRange: [prev.priceRange[0], value]
                        }));
                      }
                    }}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                    }}
                  />
                </Box>
                <Slider
                  value={filters.priceRange}
                  onChange={handlePriceChange}
                  valueLabelDisplay="auto"
                  min={minPrice}
                  max={maxPrice}
                  valueLabelFormat={(value) => `${value} ₽`}
                />
              </Box>
              
              <Divider />
              
              <Box className="category-page__filter-section">
                <Typography variant="subtitle2" gutterBottom>
                  Сезон
                </Typography>
                <RadioGroup
                  name="season"
                  value={filters.season}
                  onChange={handleSeasonChange}
                >
                  <FormControlLabel 
                    value="all" 
                    control={<Radio size="small" />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="body2">Любой сезон</Typography>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="summer" 
                    control={<Radio size="small" />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <WbSunnyIcon fontSize="small" sx={{ mr: 1, color: '#FFB900' }} />
                        <Typography variant="body2">Летний</Typography>
                      </Box>
                    } 
                  />
                  <FormControlLabel 
                    value="winter" 
                    control={<Radio size="small" />} 
                    label={
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <AcUnitIcon fontSize="small" sx={{ mr: 1, color: '#2196F3' }} />
                        <Typography variant="body2">Зимний</Typography>
                      </Box>
                    } 
                  />
                </RadioGroup>
              </Box>
              
              <Divider />
              
              <Box className="category-page__filter-section">
                <Typography variant="subtitle2" gutterBottom>
                  Тип оборудования
                </Typography>
                <Box className="category-page__equipment-types">
                  <Chip
                    icon={<DirectionsRunIcon />}
                    label="Кардио"
                    clickable
                    color={filters.equipmentType.includes('cardio') ? 'primary' : 'default'}
                    onClick={() => handleEquipmentTypeChange('cardio')}
                    className="category-page__equipment-chip"
                  />
                  <Chip
                    icon={<FitnessCenterIcon />}
                    label="Силовое"
                    clickable
                    color={filters.equipmentType.includes('strength') ? 'primary' : 'default'}
                    onClick={() => handleEquipmentTypeChange('strength')}
                    className="category-page__equipment-chip"
                  />
                  <Chip
                    icon={<SportsTennisIcon />}
                    label="Растяжка"
                    clickable
                    color={filters.equipmentType.includes('flexibility') ? 'primary' : 'default'}
                    onClick={() => handleEquipmentTypeChange('flexibility')}
                    className="category-page__equipment-chip"
                  />
                  <Chip
                    label="Восстановление"
                    clickable
                    color={filters.equipmentType.includes('recovery') ? 'primary' : 'default'}
                    onClick={() => handleEquipmentTypeChange('recovery')}
                    className="category-page__equipment-chip"
                  />
                </Box>
              </Box>
              
              <Divider />
              
              <Box className="category-page__filter-section">
                <Typography variant="subtitle2" gutterBottom>
                  Наличие и предложения
                </Typography>
                <FormGroup>
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filters.availability} 
                        onChange={handleCheckboxChange('availability')} 
                        size="small"
                      />
                    } 
                    label={<Typography variant="body2">В наличии</Typography>} 
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filters.newArrivals} 
                        onChange={handleCheckboxChange('newArrivals')} 
                        size="small"
                      />
                    } 
                    label={<Typography variant="body2">Новинки</Typography>}
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filters.popular} 
                        onChange={handleCheckboxChange('popular')} 
                        size="small"
                      />
                    } 
                    label={<Typography variant="body2">Популярные</Typography>}
                  />
                  <FormControlLabel 
                    control={
                      <Checkbox 
                        checked={filters.promotion} 
                        onChange={handleCheckboxChange('promotion')} 
                        size="small"
                      />
                    } 
                    label={<Typography variant="body2">Акции</Typography>}
                  />
                </FormGroup>
              </Box>
            </Paper>
          </Box>
          
          {/* Основной контент с товарами */}
          <Box sx={{ flex: 1 }}>
            <Box className="category-page__content" sx={{ backgroundColor: 'white', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)' }}>
              {/* Мобильная кнопка фильтров скрыта */}
              
              {/* Результаты фильтрации */}
              <Box className="category-page__results">
                {/* Верхняя панель с сортировкой и заголовком */}
                <Box className="category-page__results-header" sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5" className="category-page__title">
                    {category.title} ({filteredProducts.length})
                  </Typography>
                  
                  <FormControl variant="outlined" size="small" className="category-page__desktop-sort">
                    <InputLabel id="desktop-sort-label">
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <SortIcon fontSize="small" sx={{ mr: 0.5 }} />
                        Сортировка
                      </Box>
                    </InputLabel>
                    <Select
                      labelId="desktop-sort-label"
                      value={filters.sortBy}
                      onChange={handleSortChange}
                      label={
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <SortIcon fontSize="small" sx={{ mr: 0.5 }} />
                          Сортировка
                        </Box>
                      }
                    >
                      <MenuItem value="default">По умолчанию</MenuItem>
                      <MenuItem value="priceAsc">По цене (сначала дешевле)</MenuItem>
                      <MenuItem value="priceDesc">По цене (сначала дороже)</MenuItem>
                      <MenuItem value="nameAsc">По названию (А-Я)</MenuItem>
                      <MenuItem value="nameDesc">По названию (Я-А)</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
                
                {/* Отображение выбранных фильтров */}
                {(filters.availability || filters.newArrivals || filters.popular || filters.promotion || 
                  filters.season !== 'all' || filters.equipmentType.length > 0 ||
                  filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice) && (
                  <Box className="category-page__active-filters">
                    <Typography variant="body2" className="category-page__active-filters-label">
                      Активные фильтры:
                    </Typography>
                    
                    {filters.priceRange[0] > minPrice || filters.priceRange[1] < maxPrice ? (
                      <Box component="span" className="category-page__filter-tag">
                        Цена: {filters.priceRange[0]} ₽ - {filters.priceRange[1]} ₽
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, priceRange: [minPrice, maxPrice]}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    ) : null}
                    
                    {filters.season !== 'all' && (
                      <Box component="span" className="category-page__filter-tag">
                        Сезон: {filters.season === 'summer' ? 'Летний' : 'Зимний'}
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, season: 'all'}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {filters.equipmentType.map(type => {
                      let label = '';
                      switch (type) {
                        case 'cardio': label = 'Кардио'; break;
                        case 'strength': label = 'Силовое'; break;
                        case 'flexibility': label = 'Растяжка'; break;
                        case 'recovery': label = 'Восстановление'; break;
                      }
                      return (
                        <Box component="span" className="category-page__filter-tag" key={type}>
                          {label}
                          <IconButton 
                            size="small" 
                            onClick={() => handleEquipmentTypeChange(type)}
                          >
                            <CloseIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      );
                    })}
                    
                    {filters.availability && (
                      <Box component="span" className="category-page__filter-tag">
                        В наличии
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, availability: false}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {filters.newArrivals && (
                      <Box component="span" className="category-page__filter-tag">
                        Новинки
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, newArrivals: false}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {filters.popular && (
                      <Box component="span" className="category-page__filter-tag">
                        Популярные
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, popular: false}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    {filters.promotion && (
                      <Box component="span" className="category-page__filter-tag">
                        Акции
                        <IconButton 
                          size="small" 
                          onClick={() => setFilters(prev => ({...prev, promotion: false}))}
                        >
                          <CloseIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    )}
                    
                    <Button 
                      variant="text" 
                      size="small" 
                      onClick={handleFilterReset}
                      className="category-page__reset-button"
                    >
                      Сбросить все
                    </Button>
                  </Box>
                )}
                
                <Box className="product-grid">
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => (
                      <ProductCard key={product.id} product={product} />
                    ))
                  ) : (
                    <Box className="category-page__no-results">
                      <Typography variant="h6">Товары не найдены</Typography>
                      <Typography variant="body1">
                        По заданным параметрам фильтрации не найдено ни одного товара. 
                        Попробуйте изменить параметры фильтрации.
                      </Typography>
                      <Button 
                        variant="contained" 
                        color="primary" 
                        onClick={handleFilterReset}
                        sx={{ mt: 2 }}
                      >
                        Сбросить фильтры
                      </Button>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CategoryPage; 