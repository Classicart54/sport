import { FC } from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import './Footer.scss';

const Footer: FC = () => {
  return (
    <footer className="footer">
      <Container maxWidth={false} className="footer__container">
        <Box className="footer__content" sx={{ justifyContent: 'center' }}>
          <Box className="footer__section" sx={{ textAlign: 'center' }}>
            <Typography variant="h6" className="footer__title">
              Контакты
            </Typography>
            <Typography variant="body1" className="footer__phone">
              +7 (999) 123-45-67
            </Typography>
            <Typography variant="body1" className="footer__phone">
              +7 (999) 765-43-21
            </Typography>
            
            <Box className="footer__hours">
              <Typography variant="body2">
                Часы работы офиса:
              </Typography>
              <Typography variant="body2">
                пн.-пт. с 9:00 до 18:00
              </Typography>
            </Box>
            
            <Box className="footer__hours">
              <Typography variant="body2">
                Часы работы магазина:
              </Typography>
              <Typography variant="body2">
                Ежедневно с 10:00 до 20:00
              </Typography>
            </Box>
          </Box>
        </Box>
        
        <Divider className="footer__divider" />
        
        <Box className="footer__bottom" sx={{ textAlign: 'center' }}>
          <Box className="footer__policy" sx={{ justifyContent: 'center' }}>
            <Link className="footer__policy-link">Политика конфиденциальности</Link>
            <Link className="footer__policy-link">Политика возврата и обмена товара</Link>
          </Box>
          
          <Typography variant="body2" className="footer__copyright" sx={{ textAlign: 'center' }}>
            © ООО "СпортТех", ИНН 1234567890, 2024. Интернет-магазин спортивного оборудования.
            Обращаем ваше внимание на то, что данный интернет-сайт носит исключительно информационный характер и ни при каких условиях не
            является публичной офертой, определяемой положениями ч. 2 ст. 437 Гражданского кодекса Российской Федерации.
          </Typography>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer; 