import React, { useState } from 'react';
import { Box, Tabs, Tab, Typography } from '@mui/material';
import { 
  Inventory2Outlined, 
  ShoppingCartOutlined, 
  CommentOutlined
} from '@mui/icons-material';
import ProductsManagement from './Tabs/ProductsManagement';
import OrdersManagement from './Tabs/OrdersManagement';
import ReviewsManagement from './Tabs/ReviewsManagement';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`admin-tabpanel-${index}`}
      aria-labelledby={`admin-tab-${index}`}
      {...other}
      style={{ padding: '24px 16px' }}
    >
      {value === index && (
        <Box>
          {children}
        </Box>
      )}
    </div>
  );
};

const a11yProps = (index: number) => {
  return {
    id: `admin-tab-${index}`,
    'aria-controls': `admin-tabpanel-${index}`,
  };
};

const AdminTabs: React.FC = () => {
  const [value, setValue] = useState(0);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ 
        borderBottom: 1, 
        borderColor: 'divider',
        backgroundColor: '#f5f7fa'
      }}>
        <Tabs 
          value={value} 
          onChange={handleChange} 
          aria-label="admin tabs"
          variant="fullWidth"
          className="admin-tabs__tabs"
          sx={{
            '& .MuiTab-root': {
              color: '#555',
              opacity: 0.7,
              fontSize: '15px',
              fontWeight: 500,
              py: 2,
              textTransform: 'none'
            },
            '& .Mui-selected': {
              color: '#1976d2',
              opacity: 1,
              fontWeight: 600
            },
            '& .MuiTabs-indicator': {
              height: 3,
              borderRadius: '3px 3px 0 0'
            }
          }}
        >
          <Tab 
            icon={<Inventory2Outlined />} 
            iconPosition="start" 
            label="Товары" 
            {...a11yProps(0)} 
          />
          <Tab 
            icon={<ShoppingCartOutlined />} 
            iconPosition="start" 
            label="Заказы" 
            {...a11yProps(1)} 
          />
          <Tab 
            icon={<CommentOutlined />} 
            iconPosition="start" 
            label="Отзывы" 
            {...a11yProps(2)} 
          />
        </Tabs>
      </Box>
      <TabPanel value={value} index={0}>
        <ProductsManagement />
      </TabPanel>
      <TabPanel value={value} index={1}>
        <OrdersManagement />
      </TabPanel>
      <TabPanel value={value} index={2}>
        <ReviewsManagement />
      </TabPanel>
    </Box>
  );
};

export default AdminTabs; 