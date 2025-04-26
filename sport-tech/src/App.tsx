import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import React, { ReactNode } from 'react';
import Header from './components/Header/Header';
import Footer from './components/Footer/Footer';
import HomePage from './pages/HomePage/HomePage';
import CategoryPage from './pages/CategoryPage/CategoryPage';
import ProductPage from './pages/ProductPage/ProductPage';
import CartPage from './pages/CartPage/CartPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import SearchPage from './pages/SearchPage/SearchPage';
import ContactsPage from './pages/ContactsPage/ContactsPage';
import AdminPanel from './pages/AdminPanel/AdminPanel';
import LoginModal from './components/Auth/LoginModal';
import RegisterModal from './components/Auth/RegisterModal';
import CartNotification from './components/CartNotification/CartNotification';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ReviewsProvider } from './context/ReviewsContext';
import { OrderProvider } from './context/OrderContext';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import './App.css';

// Компонент-обертка для CartNotification, который использует useCart
const CartNotificationWrapper = () => {
  const { isCartNotificationOpen, cartNotificationProduct, closeCartNotification } = useCart();
  
  return (
    <CartNotification 
      open={isCartNotificationOpen} 
      onClose={closeCartNotification} 
      productName={cartNotificationProduct} 
    />
  );
};

// Защищенный маршрут для авторизованных пользователей
const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { auth } = useAuth();
  
  if (!auth.isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Защищенный маршрут для администраторов
const AdminRoute = ({ children }: { children: ReactNode }) => {
  const { auth } = useAuth();
  
  if (!auth.isAuthenticated || !auth.user?.isAdmin) {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

// Компонент для условного отображения хедера и футера
const AppLayout = ({ children }: { children: ReactNode }) => {
  const location = useLocation();
  const isAdminPanel = location.pathname === '/admin';
  
  return (
    <div className="app">
      {!isAdminPanel && <Header />}
      <main className="main-content">
        {children}
      </main>
      {!isAdminPanel && <Footer />}
      <LoginModal />
      <RegisterModal />
      {!isAdminPanel && <CartNotificationWrapper />}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <ReviewsProvider>
          <OrderProvider>
            <BrowserRouter>
              <AppLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/category/:categoryId" element={<CategoryPage />} />
                  <Route path="/product/:productId" element={<ProductPage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/contacts" element={<ContactsPage />} />
                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <ProfilePage />
                      </ProtectedRoute>
                    } 
                  />
                  <Route 
                    path="/admin" 
                    element={
                      <AdminRoute>
                        <AdminPanel />
                      </AdminRoute>
                    } 
                  />
                </Routes>
              </AppLayout>
            </BrowserRouter>
          </OrderProvider>
        </ReviewsProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
