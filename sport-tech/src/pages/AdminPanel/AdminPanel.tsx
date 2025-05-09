import React from 'react';
import { Box, Button, Container, Paper } from '@mui/material';
import { LogoutOutlined } from '@mui/icons-material';
import AdminTabs from '../../components/Admin/AdminTabs';
import { useAuth } from '../../context/AuthContext';
import './AdminPanel.scss';

const AdminPanel: React.FC = () => {
  const { logout } = useAuth();

  return (
    <div className="admin-panel">
      <header className="admin-panel__header">
        <h1 className="admin-panel__title">Панель администратора</h1>
      </header>
      <div className="admin-panel__content">
        <Container maxWidth="xl">
          <Paper elevation={3} sx={{ 
            borderRadius: '12px', 
            overflow: 'hidden', 
            backgroundColor: '#ffffff' 
          }}>
            <AdminTabs />
          </Paper>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Button
              variant="contained"
              color="error"
              startIcon={<LogoutOutlined />}
              className="admin-panel__logout-button"
              onClick={logout}
              sx={{ 
                fontWeight: 500, 
                px: 3, 
                py: 1.2,
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                textTransform: 'none',
                fontSize: '16px'
              }}
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