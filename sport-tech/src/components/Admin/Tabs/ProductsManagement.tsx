import React, { useState } from 'react';
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
  DialogTitle
} from '@mui/material';
import { ExpandLess, ExpandMore, Edit, Delete, Add, Close } from '@mui/icons-material';
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

// Стили для модального окна
const modalStyle = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
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
}

const ProductsManagement: React.FC = () => {
  const [openCategories, setOpenCategories] = useState<{ [key: number]: boolean }>({});
  
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
    categoryId: 1 
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
      categoryId: product.categoryId
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
    try {
      // Используем функцию из mockData для добавления и сохранения товара
      const newProduct = addProduct({
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        categoryId: productForm.categoryId
      });
      
      // Очистка формы и закрытие модального окна
      setProductForm({ name: '', price: 0, image: '', categoryId: 1 });
      handleCloseProductModal();
      
      // Открываем категорию нового товара, чтобы показать его
      setOpenCategories(prev => ({
        ...prev,
        [newProduct.categoryId]: true
      }));
      
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
    if (!currentProductId) return;
    
    try {
      // Используем функцию из mockData для обновления товара
      const updatedProduct = updateProduct({
        id: currentProductId,
        name: productForm.name,
        price: productForm.price,
        image: productForm.image,
        categoryId: productForm.categoryId
      });
      
      // Очистка формы и закрытие модального окна
      setProductForm({ name: '', price: 0, image: '', categoryId: 1 });
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
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Управление товарами
      </Typography>
      
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenCategoryModal}>
          Добавить категорию
        </Button>
        <Button variant="contained" color="primary" startIcon={<Add />} onClick={handleOpenProductModal}>
          Добавить товар
        </Button>
      </Box>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Категории и товары
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        <List component="nav" aria-label="категории и товары">
          {categories.map((category) => (
            <React.Fragment key={category.id}>
              <ListItem 
                onClick={() => handleToggleCategory(category.id)}
                sx={{ 
                  bgcolor: 'background.paper', 
                  mb: 1, 
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'action.hover' },
                  cursor: 'pointer'
                }}
              >
                <ListItemText 
                  primary={
                    <Typography variant="subtitle1" fontWeight="bold">
                      {category.title}
                    </Typography>
                  } 
                  secondary={`ID: ${category.id}`}
                />
                <IconButton 
                  size="small" 
                  sx={{ mr: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenEditCategoryModal(category);
                  }}
                >
                  <Edit fontSize="small" />
                </IconButton>
                <IconButton 
                  size="small" 
                  sx={{ mr: 1 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenDeleteCategoryDialog(category.id);
                  }}
                >
                  <Delete fontSize="small" />
                </IconButton>
                {openCategories[category.id] ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              
              <Collapse in={openCategories[category.id]} timeout="auto" unmountOnExit>
                <Box sx={{ pl: 2, pr: 2, pb: 2 }}>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {products
                      .filter(product => product.categoryId === category.id)
                      .map((product) => (
                        <Box key={product.id} sx={{ width: { xs: '100%', sm: 'calc(50% - 8px)', md: 'calc(33.333% - 10.667px)' } }}>
                          <Card>
                            <CardMedia
                              component="img"
                              height="140"
                              image={product.image}
                              alt={product.name}
                            />
                            <CardContent sx={{ pb: 1 }}>
                              <Typography variant="subtitle1" component="div" noWrap>
                                {product.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {product.price} руб/день
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                ID: {product.id}
                              </Typography>
                            </CardContent>
                            <CardActions>
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenEditProductModal(product)}
                              >
                                <Edit fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small"
                                onClick={() => handleOpenDeleteProductDialog(product.id)}
                              >
                                <Delete fontSize="small" />
                              </IconButton>
                            </CardActions>
                          </Card>
                        </Box>
                      ))}
                  </Box>
                </Box>
              </Collapse>
            </React.Fragment>
          ))}
        </List>
      </Paper>
      
      {/* Модальное окно для добавления категории */}
      <Modal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        aria-labelledby="modal-add-category"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="modal-add-category" variant="h6" component="h2">
              Добавить новую категорию
            </Typography>
            <IconButton onClick={handleCloseCategoryModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Название категории"
              name="title"
              value={categoryForm.title}
              onChange={handleCategoryFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="image"
              label="URL изображения"
              name="image"
              value={categoryForm.image}
              onChange={handleCategoryFormChange}
              helperText="Укажите прямую ссылку на изображение"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseCategoryModal} sx={{ mr: 1 }}>
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleAddCategory}
                disabled={!categoryForm.title || !categoryForm.image}
              >
                Добавить
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
      {/* Модальное окно для редактирования категории */}
      <Modal
        open={editCategoryModalOpen}
        onClose={handleCloseEditCategoryModal}
        aria-labelledby="modal-edit-category"
      >
        <Box sx={modalStyle}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography id="modal-edit-category" variant="h6" component="h2">
              Редактировать категорию
            </Typography>
            <IconButton onClick={handleCloseEditCategoryModal} size="small">
              <Close />
            </IconButton>
          </Box>
          
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="title"
              label="Название категории"
              name="title"
              value={categoryForm.title}
              onChange={handleCategoryFormChange}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="image"
              label="URL изображения"
              name="image"
              value={categoryForm.image}
              onChange={handleCategoryFormChange}
              helperText="Укажите прямую ссылку на изображение"
            />
            
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={handleCloseEditCategoryModal} sx={{ mr: 1 }}>
                Отмена
              </Button>
              <Button 
                variant="contained" 
                onClick={handleUpdateCategory}
                disabled={!categoryForm.title || !categoryForm.image}
                color="primary"
              >
                Сохранить
              </Button>
            </Box>
          </Box>
        </Box>
      </Modal>
      
      {/* Диалог подтверждения удаления категории */}
      <Dialog
        open={deleteCategoryDialogOpen}
        onClose={handleCloseDeleteCategoryDialog}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Подтверждение удаления категории"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Вы действительно хотите удалить эту категорию? Все товары в этой категории также будут удалены.
            Это действие невозможно отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteCategoryDialog}>Отмена</Button>
          <Button onClick={handleDeleteCategory} color="error" autoFocus>
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
      
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
      
      {/* Уведомления */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ProductsManagement; 