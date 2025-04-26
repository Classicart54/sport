import { FC } from 'react';
import { Box, Typography, Container } from '@mui/material';
import BoltIcon from '@mui/icons-material/Bolt';
import './Hero.scss';

const Hero: FC = () => {
  const heroStyle = {
    backgroundImage: 'url("https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1920&auto=format&fit=crop")'
  };

  return (
    <Box id="hero" className="hero" style={heroStyle}>
      <Container maxWidth={false} className="hero__container">
        <Box className="hero__content">
          <Box className="hero__badge">
            <BoltIcon fontSize="small" />
            <Typography variant="body2">Аренда за 5 минут</Typography>
          </Box>
          
          <Typography variant="h1" className="hero__title">
            Используйте спортивный инвентарь ровно столько, сколько нужно именно вам
          </Typography>
          
          <Box className="hero__underline"></Box>
        </Box>
      </Container>
    </Box>
  );
};

export default Hero; 