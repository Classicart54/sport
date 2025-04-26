import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  IconButton, 
  Chip,
  Rating,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Snackbar,
  Alert,
  Divider,
  Avatar
} from '@mui/material';
import { 
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';
import { useReviews } from '../../../context/ReviewsContext';

const ReviewsManagement: React.FC = () => {
  const { reviews, deleteReview } = useReviews();
  
  // Состояние для модального окна подтверждения удаления
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedReviewId, setSelectedReviewId] = useState<number | null>(null);
  
  // Состояние для модального окна просмотра отзыва
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<any>(null);
  
  // Состояние для уведомлений
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });
  
  // Открытие диалога подтверждения удаления
  const handleOpenDeleteDialog = (reviewId: number) => {
    setSelectedReviewId(reviewId);
    setDeleteDialogOpen(true);
  };
  
  // Закрытие диалога подтверждения удаления
  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setSelectedReviewId(null);
  };
  
  // Открытие диалога просмотра отзыва
  const handleOpenViewDialog = (review: any) => {
    setSelectedReview(review);
    setViewDialogOpen(true);
  };
  
  // Закрытие диалога просмотра отзыва
  const handleCloseViewDialog = () => {
    setViewDialogOpen(false);
    setSelectedReview(null);
  };
  
  // Удаление отзыва
  const handleDeleteReview = async () => {
    if (selectedReviewId === null) return;
    
    const result = await deleteReview(selectedReviewId);
    
    setSnackbar({
      open: true,
      message: result.message || (result.success ? 'Отзыв успешно удален' : 'Ошибка при удалении отзыва'),
      severity: result.success ? 'success' : 'error'
    });
    
    handleCloseDeleteDialog();
  };
  
  // Закрытие уведомления
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false
    });
  };
  
  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    try {
      return dateString;
    } catch (error) {
      return dateString;
    }
  };
  
  return (
    <Box sx={{ p: 2 }}>
      <Typography variant="h5" gutterBottom>
        Управление отзывами
      </Typography>
      
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Список отзывов
        </Typography>
        <Divider sx={{ mb: 2 }} />
        
        {reviews.length === 0 ? (
          <Typography variant="body1" sx={{ textAlign: 'center', py: 3 }}>
            Отзывы отсутствуют
          </Typography>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Дата</TableCell>
                  <TableCell>Товар</TableCell>
                  <TableCell>Автор</TableCell>
                  <TableCell>Рейтинг</TableCell>
                  <TableCell>Текст отзыва</TableCell>
                  <TableCell>Действия</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {reviews.map((review) => (
                  <TableRow key={review.id} hover>
                    <TableCell>{review.id}</TableCell>
                    <TableCell>{formatDate(review.date)}</TableCell>
                    <TableCell>ID: {review.productId}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {review.avatar && (
                          <Avatar src={review.avatar} alt={review.author} sx={{ width: 24, height: 24 }} />
                        )}
                        {review.author}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Rating value={review.rating} readOnly size="small" />
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography variant="body2" noWrap>
                        {review.text}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton 
                          size="small" 
                          color="primary"
                          onClick={() => handleOpenViewDialog(review)}
                        >
                          <VisibilityIcon fontSize="small" />
                        </IconButton>
                        <IconButton 
                          size="small" 
                          color="error"
                          onClick={() => handleOpenDeleteDialog(review.id)}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
      
      {/* Диалог просмотра отзыва */}
      <Dialog 
        open={viewDialogOpen} 
        onClose={handleCloseViewDialog}
        maxWidth="sm"
        fullWidth
      >
        {selectedReview && (
          <>
            <DialogTitle>
              Просмотр отзыва #{selectedReview.id}
            </DialogTitle>
            <DialogContent>
              <Box sx={{ mb: 2, display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                <Avatar 
                  src={selectedReview.avatar} 
                  alt={selectedReview.author}
                  sx={{ width: 48, height: 48 }}
                />
                <Box>
                  <Typography variant="h6">
                    {selectedReview.author}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                    <Rating value={selectedReview.rating} readOnly />
                    <Typography variant="body2" color="text.secondary">
                      {formatDate(selectedReview.date)}
                    </Typography>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                    ID товара: {selectedReview.productId}
                  </Typography>
                  <Typography variant="body1">
                    {selectedReview.text}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseViewDialog}>
                Закрыть
              </Button>
              <Button 
                color="error" 
                variant="contained"
                onClick={() => {
                  handleCloseViewDialog();
                  handleOpenDeleteDialog(selectedReview.id);
                }}
              >
                Удалить отзыв
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Диалог подтверждения удаления */}
      <Dialog
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle>
          Подтверждение удаления
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы действительно хотите удалить отзыв? Это действие нельзя будет отменить.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>
            Отмена
          </Button>
          <Button 
            color="error" 
            variant="contained"
            onClick={handleDeleteReview}
          >
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
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ReviewsManagement; 