import React, { useState } from 'react';
import { 
  Typography, 
  Box, 
  Rating, 
  Avatar, 
  Button, 
  Divider,
  Pagination
} from '@mui/material';
import { Review } from '../../types/interfaces';
import './ReviewsList.scss';

interface ReviewsListProps {
  reviews: Review[];
  totalReviews?: number;
  showPagination?: boolean;
  itemsPerPage?: number;
  onLoadMore?: () => void;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ 
  reviews, 
  totalReviews, 
  showPagination = false,
  itemsPerPage = 5,
  onLoadMore 
}) => {
  const [page, setPage] = useState(1);
  const totalPages = totalReviews ? Math.ceil(totalReviews / itemsPerPage) : 1;
  
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
    
    if (onLoadMore) {
      onLoadMore();
    }
    
    // Прокрутка к началу списка отзывов
    const reviewsSection = document.getElementById('reviews-section');
    if (reviewsSection) {
      reviewsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  if (reviews.length === 0) {
    return (
      <Box className="reviews-list reviews-list--empty">
        <Typography variant="body1" className="reviews-list__empty-message">
          Отзывов пока нет. Будьте первым, кто оставит отзыв об этом товаре!
        </Typography>
      </Box>
    );
  }
  
  return (
    <Box className="reviews-list">
      {reviews.map((review) => (
        <Box key={review.id} className="reviews-list__item">
          <Box className="reviews-list__header">
            <Avatar 
              src={review.avatar} 
              className="reviews-list__avatar"
            >
              {!review.avatar && review.author.charAt(0)}
            </Avatar>
            
            <Box className="reviews-list__meta">
              <Typography variant="subtitle1" className="reviews-list__author">
                {review.author}
              </Typography>
              <Typography variant="body2" className="reviews-list__date">
                {review.date}
              </Typography>
            </Box>
            
            <Rating 
              value={review.rating} 
              readOnly 
              size="small" 
              className="reviews-list__rating"
            />
          </Box>
          
          <Typography variant="body1" className="reviews-list__text">
            {review.text}
          </Typography>
          
          <Divider className="reviews-list__divider" />
        </Box>
      ))}
      
      {showPagination && totalReviews && totalReviews > itemsPerPage ? (
        <Box className="reviews-list__pagination">
          <Pagination 
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
          />
        </Box>
      ) : onLoadMore && totalReviews && reviews.length < totalReviews ? (
        <Button 
          variant="outlined" 
          onClick={onLoadMore}
          className="reviews-list__load-more"
        >
          Показать еще отзывы
        </Button>
      ) : null}
    </Box>
  );
};

export default ReviewsList; 