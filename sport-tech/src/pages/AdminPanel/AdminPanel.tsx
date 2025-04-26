import React from 'react';
import { Container, Box, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import Button from '@mui/material/Button';
import AdminTabs from '../../components/Admin/AdminTabs';
import './AdminPanel.scss';

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="admin-panel">
      <Box className="admin-panel__header">
        <Typography variant="h4" className="admin-panel__title">
          Панель администратора
        </Typography>
      </Box>
      
      <div className="admin-panel__content">
        <Container>
          <AdminTabs />
          <Box mt={4} textAlign="center">
            <Button 
              variant="contained" 
              color="error"
              onClick={handleLogout} 
              className="admin-panel__logout-button"
            >
              Выйти
            </Button>
          </Box>
        </Container>
      </div>
    </div>
  );
};

export default AdminPanel; 