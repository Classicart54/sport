import { FC } from 'react';
import { 
  Container, 
  Box, 
  Typography, 
  Divider, 
  Card,
  CardContent 
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import EmailIcon from '@mui/icons-material/Email';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import './ContactsPage.scss';

const ContactsPage: FC = () => {
  return (
    <Box className="contacts-page">
      {/* Hero секция */}
      <Box className="contacts-page__hero">
        <Container>
          <Typography variant="h2" className="contacts-page__title">
            Наши контакты
          </Typography>
          <Typography variant="subtitle1" className="contacts-page__subtitle">
            Мы всегда рады помочь вам с выбором спортивного оборудования
          </Typography>
        </Container>
      </Box>
      
      <Container maxWidth="lg">
        <Box className="contacts-page__content" sx={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
          {/* Контактная информация */}
          <Box sx={{ width: { xs: '100%', md: '48%', lg: '40%' } }}>
            <Card className="contacts-page__card">
              <CardContent>
                <Typography variant="h5" className="contacts-page__card-title" gutterBottom>
                  Контактная информация
                </Typography>
                
                <Box className="contacts-page__info-item">
                  <LocationOnIcon className="contacts-page__icon" />
                  <Box>
                    <Typography variant="body1" className="contacts-page__info-title">
                      Адрес
                    </Typography>
                    <Typography variant="body2" className="contacts-page__info-text">
                      г. Новосибирск, ул. Спортивная, д. 1
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="contacts-page__info-item">
                  <PhoneIcon className="contacts-page__icon" />
                  <Box>
                    <Typography variant="body1" className="contacts-page__info-title">
                      Телефон
                    </Typography>
                    <Typography variant="body2" className="contacts-page__info-text">
                      +7 (999) 123-45-67
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="contacts-page__info-item">
                  <EmailIcon className="contacts-page__icon" />
                  <Box>
                    <Typography variant="body1" className="contacts-page__info-title">
                      Email
                    </Typography>
                    <Typography variant="body2" className="contacts-page__info-text">
                      info@sport-tech.ru
                    </Typography>
                  </Box>
                </Box>
                
                <Box className="contacts-page__info-item">
                  <AccessTimeIcon className="contacts-page__icon" />
                  <Box>
                    <Typography variant="body1" className="contacts-page__info-title">
                      Время работы
                    </Typography>
                    <Typography variant="body2" className="contacts-page__info-text">
                      Пн-Пт: 9:00 - 18:00
                    </Typography>
                    <Typography variant="body2" className="contacts-page__info-text">
                      Сб-Вс: 10:00 - 20:00
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Box>
          
          {/* Карта */}
          <Box sx={{ width: { xs: '100%', md: '48%', lg: '56%' } }}>
            <Card className="contacts-page__card contacts-page__map-card">
              <CardContent className="contacts-page__map-content">
                <Typography variant="h5" className="contacts-page__card-title" gutterBottom>
                  Мы на карте
                </Typography>
                
                <Box className="contacts-page__map-container">
                  {/* Здесь будет iframe с картой */}
                  <iframe 
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d142923.3813634308!2d82.82001019505617!3d55.00029619880586!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x42dfe5e190cc4d97%3A0x9b3a0673e1d3e985!2z0J3QvtCy0L7RgdC40LHQuNGA0YHQug!5e0!3m2!1sru!2sru!4v1650000000000!5m2!1sru!2sru" 
                    width="100%" 
                    height="450" 
                    style={{ border: 0 }} 
                    allowFullScreen 
                    loading="lazy" 
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Карта с нашим местоположением"
                    className="contacts-page__map"
                  />
                </Box>
                
                <Box className="contacts-page__directions">
                  <Typography variant="h6" gutterBottom>
                    Как добраться
                  </Typography>
                  <Typography variant="body2">
                    От метро "Спортивная" - 5 минут пешком.
                  </Typography>
                  <Typography variant="body2">
                    Парковка бесплатная для клиентов (до 2-х часов).
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default ContactsPage; 