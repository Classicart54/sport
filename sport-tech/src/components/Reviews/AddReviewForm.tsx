import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  Button, 
  Rating, 
  Paper,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import './AddReviewForm.scss';

interface AddReviewFormProps {
  productId: number;
  onAddReview: (review: { rating: number; text: string }) => Promise<{ success: boolean; message?: string }>;
}

const AddReviewForm: React.FC<AddReviewFormProps> = ({ productId, onAddReview }) => {
  const { auth, openLoginModal } = useAuth();
  const [rating, setRating] = useState<number | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('AddReviewForm handleSubmit called', { rating, text });
    
    if (!auth.isAuthenticated) {
      console.log('User not authenticated, opening login modal');
      openLoginModal();
      return;
    }
    
    if (!rating) {
      console.warn('Rating not provided');
      setError('Пожалуйста, укажите оценку');
      return;
    }
    
    if (text.trim().length < 10) {
      console.warn('Review text too short');
      setError('Отзыв должен содержать не менее 10 символов');
      return;
    }
    
    setLoading(true);
    try {
      console.log('Sending review to onAddReview handler');
      const response = await onAddReview({ rating, text });
      console.log('Received response from onAddReview:', response);
      
      if (response.success) {
        console.log('Review successfully added');
        setSuccess(true);
        setRating(null);
        setText('');
      } else {
        console.warn('Failed to add review:', response.message);
        setError(response.message || 'Не удалось добавить отзыв. Попробуйте позже.');
      }
    } catch (err) {
      console.error('Error in AddReviewForm handleSubmit:', err);
      setError('Произошла ошибка при добавлении отзыва');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseError = () => {
    setError('');
  };

  const handleCloseSuccess = () => {
    setSuccess(false);
  };

  if (!auth.isAuthenticated) {
    return (
      <Paper className="add-review-form">
        <Typography variant="h6" className="add-review-form__title">
          Написать отзыв
        </Typography>
        <Typography variant="body1" sx={{ mb: 2 }}>
          Чтобы оставить отзыв, необходимо войти в учетную запись
        </Typography>
        <Button 
          variant="contained" 
          onClick={openLoginModal}
          className="add-review-form__login-button"
        >
          Войти
        </Button>
      </Paper>
    );
  }

  return (
    <Paper className="add-review-form">
      <Typography variant="h6" className="add-review-form__title">
        Написать отзыв
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Box className="add-review-form__rating-container">
          <Typography variant="body1" className="add-review-form__rating-label">
            Ваша оценка:
          </Typography>
          <Rating 
            name="review-rating"
            value={rating}
            onChange={(_, newValue) => setRating(newValue)}
            size="large"
            className="add-review-form__rating"
          />
        </Box>
        
        <TextField
          multiline
          rows={4}
          placeholder="Поделитесь своими впечатлениями о товаре..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          fullWidth
          variant="outlined"
          className="add-review-form__text-field"
        />
        
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          className="add-review-form__submit-button"
        >
          {loading ? <CircularProgress size={24} /> : 'Отправить отзыв'}
        </Button>
      </form>
      
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
      
      <Snackbar open={success} autoHideDuration={6000} onClose={handleCloseSuccess}>
        <Alert onClose={handleCloseSuccess} severity="success" sx={{ width: '100%' }}>
          Ваш отзыв успешно добавлен! Спасибо за обратную связь.
        </Alert>
      </Snackbar>
    </Paper>
  );
};

export default AddReviewForm; 