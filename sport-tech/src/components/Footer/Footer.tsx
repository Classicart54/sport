import { FC } from 'react';
import { Box, Container, Typography, Link, Divider } from '@mui/material';
import './Footer.scss';

const Footer: FC = () => {
  return (
    <footer className="footer">
      <Container maxWidth={false} className="footer__container">
        <Box className="footer__content">
          <Box className="footer__section">
            <Typography variant="h6" className="footer__title">
              Контакты
            </Typography>
            <Typography variant="body1" className="footer__phone">
              +7 495 646-80-96
            </Typography>
            <Typography variant="body1" className="footer__phone">
              8 800 333-12-81
            </Typography>
            
            <Box className="footer__hours">
              <Typography variant="body2">
                Часы работы офиса:
              </Typography>
              <Typography variant="body2">
                пн.-пт. с 9:00 до 19:00
              </Typography>
            </Box>
            
            <Box className="footer__hours">
              <Typography variant="body2">
                Часы работы павильона
              </Typography>
              <Typography variant="body2">
                в ТЦ «АФИМолл Сити»:
              </Typography>
              <Typography variant="body2">
                Ежедневно с 10:00 до 22:00
              </Typography>
            </Box>
          </Box>
          
          <Box className="footer__section">
            <Typography variant="h6" className="footer__title">
              Каталог
            </Typography>
            <Link className="footer__link">Массаж</Link>
            <Link className="footer__link">Спорт</Link>
            <Link className="footer__link">Красота</Link>
          </Box>
        </Box>
        
        <Divider className="footer__divider" />
        
        <Box className="footer__bottom">
          <Box className="footer__policy">
            <Link className="footer__policy-link">Политика конфиденциальности</Link>
            <Link className="footer__policy-link">Политика возврата и обмена товара</Link>
          </Box>
          
          <Typography variant="body2" className="footer__copyright">
            Эксклюзивный дистрибьютор массажного оборудования в России и СНГ © ООО «ИРА», ИНН 9710254170, 2024. Интернет-магазин г. Москва.
            Обращаем ваше внимание на то, что данный интернет-сайт носит исключительно информационный характер и ни при каких условиях не
            является публичной офертой, определяемой положениями ч. 2 ст. 437 Гражданского кодекса Российской Федерации.
          </Typography>
        </Box>
      </Container>
    </footer>
  );
};

export default Footer; 