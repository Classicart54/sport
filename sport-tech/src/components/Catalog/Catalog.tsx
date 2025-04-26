import { FC } from 'react';
import { Link } from 'react-router-dom';
import { Box, Typography, Container } from '@mui/material';
import { categories } from '../../data/mockData';
import './Catalog.scss';

const Catalog: FC = () => {
  return (
    <Box id="catalog" className="catalog">
      <Container maxWidth={false} className="catalog__container">
        <Typography variant="h2" className="catalog__title">
          Каталог
        </Typography>
        
        <div className="catalog__grid">
          {categories.map((category) => (
            <div key={category.id} className="catalog__grid-item">
              <Link to={`/category/${category.id}`} className="catalog-card-link">
                <Box 
                  className="catalog-card"
                  style={{ backgroundImage: `url(${category.image})` }}
                >
                  <Box className="catalog-card__content">
                    <Typography variant="body2" className="catalog-card__subtitle">
                      100+ производителей
                    </Typography>
                    <Typography variant="h3" className="catalog-card__title">
                      {category.title}
                    </Typography>
                  </Box>
                </Box>
              </Link>
            </div>
          ))}
        </div>
      </Container>
    </Box>
  );
};

export default Catalog; 