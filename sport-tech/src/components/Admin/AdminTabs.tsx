import React, { useState } from 'react';
import { Box, Tabs, Tab } from '@mui/material';
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
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
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
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="admin tabs">
          <Tab label="Товары" {...a11yProps(0)} />
          <Tab label="Заказы" {...a11yProps(1)} />
          <Tab label="Отзывы" {...a11yProps(2)} />
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