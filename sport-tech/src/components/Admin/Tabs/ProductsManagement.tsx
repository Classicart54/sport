import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  List, 
  ListItem, 
  ListItemText, 
  Collapse, 
  IconButton,
  Paper,
  Divider,
  Button,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Modal,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Grid,
  FormControlLabel,
  Switch,
  TableContainer,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  Chip
} from '@mui/material';
import { 
  ExpandLess, ExpandMore, Edit, Delete, Add, Close, 
  Inventory2Outlined as InventoryIcon,
  CategoryOutlined as CategoryIcon,
  PhotoOutlined as PhotoIcon
} from '@mui/icons-material';
import { 
  categories, 
  products, 
  addCategory, 
  addProduct, 
  updateCategory, 
  updateProduct, 
  deleteCategory, 
  deleteProduct 
} from '../../../data/mockData';
import { Category, Product } from '../../../types/interfaces';

// Стили для модального окна
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 450,
  bgcolor: 'background.paper',
  borderRadius: '12px',
  boxShadow: 24,
  p: 4,
};

interface CategoryFormData {
  title: string;
  image: string;
}

interface ProductFormData {
  name: string;
  price: number;
  image: string;
  categoryId: number;
  available: boolean;
}

const ProductsManagement: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({
    0: true // Устанавливаем начальное значение, чтобы товары отображались по умолчанию
  });
  
  // Состояния для модальных окон
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [editCategoryModalOpen, setEditCategoryModalOpen] = useState(false);
  const [editProductModalOpen, setEditProductModalOpen] = useState(false);
  const [deleteCategoryDialogOpen, setDeleteCategoryDialogOpen] = useState(false);
  const [deleteProductDialogOpen, setDeleteProductDialogOpen] = useState(false);
  
  // Состояния для форм
  const [categoryForm, setCategoryForm] = useState<CategoryFormData>({ title: '', image: '' });
  const [productForm, setProductForm] = useState<ProductFormData>({ 
    name: '', 
    price: 0, 
    image: '', 
    categoryId: 1,
    available: true
  });
  
  // Состояния для редактирования
  const [currentCategoryId, setCurrentCategoryId] = useState<number | null>(null);
  const [currentProductId, setCurrentProductId] = useState<number | null>(null);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  // Добавляем эффект для инициализации состояния категорий
  useEffect(() => {
    // Открываем все категории по умолчанию
    const initialOpenState: { [key: number]: boolean } = { 0: true };
    categories.forEach(category => {
      initialOpenState[category.id] = true;
    });
    setOpenCategories(initialOpenState);
  }, []);

  // Обработчики для категорий
  const handleToggleCategory = (categoryId: number) => {
    setOpenCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };
  
  const handleOpenCategoryModal = () => setCategoryModalOpen(true);
  const handleCloseCategoryModal = () => setCategoryModalOpen(false);
  
  const handleOpenEditCategoryModal = (category: Category) => {
    setCategoryForm({
      title: category.title,
      image: category.image
    });
    setCurrentCategoryId(category.id);
    setEditCategoryModalOpen(true);
  };
  
  const handleCloseEditCategoryModal = () => {
    setEditCategoryModalOpen(false);
    setCurrentCategoryId(null);
  };
  
  const handleOpenDeleteCategoryDialog = (categoryId: number) => {
    setCurrentCategoryId(categoryId);
    setDeleteCategoryDialogOpen(true);
  };
  
  const handleCloseDeleteCategoryDialog = () => {
    setDeleteCategoryDialogOpen(false);
    setCurrentCategoryId(null);
  };
  
  const handleCategoryFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCategoryForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleAddCategory = () => {
    try {
      // Используем функцию из mockData для добавления и сохранения категории
      const newCategory = addCategory({
        title: categoryForm.title,
        image: categoryForm.image
      });
      
      // Очистка формы и закрытие модального окна
      setCategoryForm({ title: '', image: '' });
      handleCloseCategoryModal();
      
      // Открываем новую категорию в списке
      setOpenCategories(prev => ({
        ...prev,
        [newCategory.id]: true
      }));
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Категория успешно добавлена',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при добавлении категории:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при добавлении категории',
        severity: 'error'
      });
    }
  };
  
  const handleUpdateCategory = () => {
    if (!currentCategoryId) return;
    
    try {
      // Используем функцию из mockData для обновления категории
      const updatedCategory = updateCategory({
        id: currentCategoryId,
        title: categoryForm.title,
        image: categoryForm.image
      });
      
      // Очистка формы и закрытие модального окна
      setCategoryForm({ title: '', image: '' });
      handleCloseEditCategoryModal();
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Категория успешно обновлена',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при обновлении категории:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при обновлении категории',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteCategory = () => {
    if (!currentCategoryId) return;
    
    try {
      // Используем функцию из mockData для удаления категории
      deleteCategory(currentCategoryId);
      
      // Обновляем состояние, убирая удаленную категорию из списка открытых категорий
      setOpenCategories(prev => {
        const newState = { ...prev };
        delete newState[currentCategoryId];
        return newState;
      });
      
      // Закрытие диалога
      handleCloseDeleteCategoryDialog();
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Категория и все товары в ней успешно удалены',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при удалении категории:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при удалении категории',
        severity: 'error'
      });
    }
  };
  
  // Обработчики для товаров
  const handleOpenProductModal = () => setProductModalOpen(true);
  const handleCloseProductModal = () => setProductModalOpen(false);
  
  const handleOpenEditProductModal = (product: Product) => {
    setProductForm({
      name: product.name,
      price: product.price,
      image: product.image,
      categoryId: product.categoryId,
      available: product.available !== undefined ? product.available : true
    });
    setCurrentProductId(product.id);
    setEditProductModalOpen(true);
  };
  
  const handleCloseEditProductModal = () => {
    setEditProductModalOpen(false);
    setCurrentProductId(null);
  };
  
  const handleOpenDeleteProductDialog = (productId: number) => {
    setCurrentProductId(productId);
    setDeleteProductDialogOpen(true);
  };
  
  const handleCloseDeleteProductDialog = () => {
    setDeleteProductDialogOpen(false);
    setCurrentProductId(null);
  };
  
  const handleProductFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProductForm(prev => ({ ...prev, [name]: value }));
  };
  
  const handleCategoryChange = (e: any) => {
    setProductForm(prev => ({ ...prev, categoryId: e.target.value }));
  };
  
  const handleAddProduct = () => {
    if (!productForm.name || !productForm.price || !productForm.image || !productForm.categoryId) {
      return;
    }

    try {
      // Используем функцию из mockData для добавления товара
      const newProduct = addProduct({
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        categoryId: productForm.categoryId,
        available: productForm.available
      });
      
      // Очистка формы и закрытие модального окна
      setProductForm({ 
        name: '', 
        price: 0, 
        image: '', 
        categoryId: categories[0]?.id || 1,
        available: true 
      });
      handleCloseProductModal();
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Товар успешно добавлен',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при добавлении товара:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при добавлении товара',
        severity: 'error'
      });
    }
  };
  
  const handleUpdateProduct = () => {
    if (!currentProductId || !productForm.name || !productForm.price || !productForm.image || !productForm.categoryId) {
      return;
    }
    
    try {
      // Используем функцию из mockData для обновления товара
      const updatedProduct = updateProduct({
        id: currentProductId,
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        categoryId: productForm.categoryId,
        available: productForm.available
      });
      
      // Очистка формы и закрытие модального окна
      handleCloseEditProductModal();
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Товар успешно обновлен',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при обновлении товара:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при обновлении товара',
        severity: 'error'
      });
    }
  };
  
  const handleDeleteProduct = () => {
    if (!currentProductId) return;
    
    try {
      // Используем функцию из mockData для удаления товара
      deleteProduct(currentProductId);
      
      // Закрытие диалога
      handleCloseDeleteProductDialog();
      
      // Показываем уведомление об успехе
      setSnackbar({
        open: true,
        message: 'Товар успешно удален',
        severity: 'success'
      });
    } catch (error) {
      console.error('Ошибка при удалении товара:', error);
      setSnackbar({
        open: true,
        message: 'Ошибка при удалении товара',
        severity: 'error'
      });
    }
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
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
        <InventoryIcon sx={{ color: '#1565c0' }} />
        Управление товарами
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Button 
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenCategoryModal}
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none',
            bgcolor: '#1976d2',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Добавить категорию
        </Button>
        
        <Button 
          variant="contained"
          startIcon={<Add />}
          onClick={handleOpenProductModal}
          sx={{ 
            borderRadius: '8px', 
            textTransform: 'none',
            bgcolor: '#2e7d32',
            fontWeight: 500,
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          }}
        >
          Добавить товар
        </Button>
      </Box>
      
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
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <CategoryIcon sx={{ color: '#1565c0' }} />
          Категории и товары
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        {/* Список категорий */}
        <List component="nav" aria-label="categories list" sx={{ mb: 4 }}>
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              <ListItem 
                button
                onClick={() => handleToggleCategory(category.id)}
                sx={{ 
                  borderRadius: '8px',
                  mb: 1,
                  '&:hover': { bgcolor: 'rgba(25, 118, 210, 0.04)' }
                }}
              >
                <Box 
                  component="img" 
                  src={category.image} 
                  alt={category.title}
                  sx={{ 
                    width: 40, 
                    height: 40, 
                    borderRadius: '6px',
                    objectFit: 'cover',
                    mr: 2
                  }}
                />
                <ListItemText 
                  primary={category.title} 
                  secondary={`${products.filter(p => p.categoryId === category.id).length} товаров`}
                />
                <Box sx={{ display: 'flex' }}>
                  <IconButton 
                    edge="end" 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenEditCategoryModal(category);
                    }}
                    sx={{ 
                      color: '#1976d2',
                      bgcolor: 'rgba(25, 118, 210, 0.08)',
                      mx: 0.5,
                      '&:active': { bgcolor: 'rgba(25, 118, 210, 0.16)' }
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton 
                    edge="end"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenDeleteCategoryDialog(category.id);
                    }}
                    sx={{ 
                      color: '#d32f2f',
                      bgcolor: 'rgba(211, 47, 47, 0.08)',
                      '&:active': { bgcolor: 'rgba(211, 47, 47, 0.16)' }
                    }}
                  >
                    <Delete />
                  </IconButton>
                </Box>
                {openCategories[category.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openCategories[category.id]} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 1 }}>
                  {products.filter(product => product.categoryId === category.id).map(product => (
                    <Box 
                      key={product.id}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        p: 1,
                        borderRadius: '8px',
                        mb: 1,
                        '&:hover': { bgcolor: 'rgba(0, 0, 0, 0.02)' }
                      }}
                    >
                      <Box 
                        component="img" 
                        src={product.image} 
                        alt={product.name}
                        sx={{ 
                          width: 40, 
                          height: 40, 
                          borderRadius: '4px',
                          objectFit: 'cover',
                          mr: 2
                        }}
                      />
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 500 }}>
                          {product.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {product.price} ₽/день
                        </Typography>
                      </Box>
                      <Chip 
                        label={product.available !== false ? "Доступен" : "Недоступен"} 
                        color={product.available !== false ? "success" : "error"}
                        size="small"
                        sx={{ mr: 1 }}
                      />
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenEditProductModal(product)}
                        sx={{ 
                          color: '#1976d2',
                          p: 1,
                          mr: 0.5
                        }}
                      >
                        <Edit fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleOpenDeleteProductDialog(product.id)}
                        sx={{ 
                          color: '#d32f2f',
                          p: 1
                        }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  ))}
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      {/* Модальное окно для добавления категории */}
      <Modal open={categoryModalOpen} onClose={handleCloseCategoryModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Добавить категорию
            </Typography>
            <IconButton 
              onClick={handleCloseCategoryModal}
              size="small"
              sx={{ 
                bgcolor: '#f1f5f9',
                '&:active': { bgcolor: '#e2e8f0' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
            <TextField
              fullWidth
              label="Название категории"
              name="title"
              value={categoryForm.title}
              onChange={handleCategoryFormChange}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2, mt: 1 }}
            />
          
            <TextField
              fullWidth
              label="URL изображения"
              name="image"
              value={categoryForm.image}
              onChange={handleCategoryFormChange}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Введите URL изображения для категории"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseCategoryModal}
              sx={{ 
                mr: 1,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddCategory}
              disabled={!categoryForm.title}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none'
              }}
              >
                Добавить
              </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Модальное окно для редактирования категории */}
      <Modal open={editCategoryModalOpen} onClose={handleCloseEditCategoryModal}>
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Редактировать категорию
            </Typography>
            <IconButton 
              onClick={handleCloseEditCategoryModal}
              size="small"
              sx={{ 
                bgcolor: '#f1f5f9',
                '&:active': { bgcolor: '#e2e8f0' }
              }}
            >
              <Close />
            </IconButton>
          </Box>
          
            <TextField
              fullWidth
              label="Название категории"
              name="title"
              value={categoryForm.title}
              onChange={handleCategoryFormChange}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2, mt: 1 }}
            />
          
            <TextField
              fullWidth
              label="URL изображения"
              name="image"
              value={categoryForm.image}
              onChange={handleCategoryFormChange}
            margin="normal"
            variant="outlined"
            sx={{ mb: 2 }}
            helperText="Введите URL изображения для категории"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
            <Button 
              onClick={handleCloseEditCategoryModal}
              sx={{ 
                mr: 1,
                borderRadius: '8px',
                textTransform: 'none'
              }}
            >
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateCategory}
                color="primary"
              disabled={!categoryForm.title}
              sx={{ 
                borderRadius: '8px',
                textTransform: 'none'
              }}
              >
                Сохранить
              </Button>
          </Box>
        </Box>
      </Modal>
      
      {/* Модальное окно для добавления товара */}
      <Modal
        open={productModalOpen}
        onClose={handleCloseProductModal}
        aria-labelledby="modal-add-product"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="modal-add-product" variant="h6" component="h2">
              Добавить новый товар
            </Typography>
            <IconButton onClick={handleCloseProductModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Название товара"
              name="name"
              value={productForm.name}
              onChange={handleProductFormChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-select-label">Категория</InputLabel>
              <Select
                labelId="category-select-label"
                id="categoryId"
                name="categoryId"
                value={productForm.categoryId}
                label="Категория"
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="price"
              label="Цена аренды в день"
              name="price"
              type="number"
              value={productForm.price}
              onChange={handleProductFormChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="image"
              label="URL изображения"
              name="image"
              value={productForm.image}
              onChange={handleProductFormChange}
              helperText="Укажите прямую ссылку на изображение"
            />
            
            <FormControl component="fieldset" margin="normal">
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.available}
                    onChange={(e) => setProductForm(prev => ({ ...prev, available: e.target.checked }))}
                    name="available"
                    color="primary"
                  />
                }
                label="Товар доступен для аренды"
              />
            </FormControl>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseProductModal} sx={{ mr: 1 }}>
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddProduct}
                disabled={!productForm.name || !productForm.image || productForm.price <= 0}
              >
                Добавить
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
      {/* Модальное окно для редактирования товара */}
      <Modal
        open={editProductModalOpen}
        onClose={handleCloseEditProductModal}
        aria-labelledby="modal-edit-product"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="modal-edit-product" variant="h6" component="h2">
              Редактировать товар
            </Typography>
            <IconButton onClick={handleCloseEditProductModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Название товара"
              name="name"
              value={productForm.name}
              onChange={handleProductFormChange}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel id="category-select-label">Категория</InputLabel>
              <Select
                labelId="category-select-label"
                id="categoryId"
                name="categoryId"
                value={productForm.categoryId}
                label="Категория"
                onChange={handleCategoryChange}
              >
                {categories.map(category => (
                  <MenuItem key={category.id} value={category.id}>
                    {category.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="price"
              label="Цена аренды в день"
              name="price"
              type="number"
              value={productForm.price}
              onChange={handleProductFormChange}
              InputProps={{ inputProps: { min: 0 } }}
            />
            
            <TextField
              margin="normal"
              required
              fullWidth
              id="image"
              label="URL изображения"
              name="image"
              value={productForm.image}
              onChange={handleProductFormChange}
              helperText="Укажите прямую ссылку на изображение"
            />
            
            <FormControl component="fieldset" margin="normal">
              <FormControlLabel
                control={
                  <Switch
                    checked={productForm.available}
                    onChange={(e) => setProductForm(prev => ({ ...prev, available: e.target.checked }))}
                    name="available"
                    color="primary"
                  />
                }
                label="Товар доступен для аренды"
              />
            </FormControl>
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseEditProductModal} sx={{ mr: 1 }}>
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateProduct}
                disabled={!productForm.name || !productForm.image || productForm.price <= 0}
                color="primary"
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
      {/* Диалог подтверждения удаления товара */}
      <Dialog
        open={deleteProductDialogOpen}
        onClose={handleCloseDeleteProductDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Подтверждение удаления товара"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы действительно хотите удалить этот товар? Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteProductDialog}>Отмена</Button>
          <Button onClick={handleDeleteProduct} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Диалог подтверждения удаления категории */}
      <Dialog
        open={deleteCategoryDialogOpen}
        onClose={handleCloseDeleteCategoryDialog}
        aria-labelledby="category-alert-dialog-title"
        aria-describedby="category-alert-dialog-description"
      >
        <DialogTitle id="category-alert-dialog-title">
          {"Подтверждение удаления категории"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="category-alert-dialog-description">
            Вы действительно хотите удалить эту категорию? Вместе с категорией будут удалены все товары, принадлежащие к ней. Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog}>Отмена</Button>
          <Button onClick={handleDeleteCategory} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={5000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsManagement; 