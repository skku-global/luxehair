import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import HomePage from './pages/HomePage';
import CatalogPage from './pages/CatalogPage';
import ProductDetailPage from './pages/ProductDetailPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderConfirmationPage from './pages/OrderConfirmationPage';
import AccountPage from './pages/AccountPage';
import AdminDashboardPage from './pages/AdminDashboardPage';

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <CurrencyProvider>
          <AuthProvider>
            <CartProvider>
              <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: 'var(--bg-primary, #0E0D0C)', color: 'var(--text-primary, #F2EFEA)', transition: 'background-color 0.3s ease, color 0.3s ease' }}>
                <Navbar />
                <CartDrawer />

            <main style={{ flex: 1 }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<CatalogPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/order-confirmation/:orderNumber" element={<OrderConfirmationPage />} />
                <Route path="/account" element={<AccountPage />} />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute adminOnly={true}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="*" element={<HomePage />} />
              </Routes>
            </main>

            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
      </CurrencyProvider>
      </ThemeProvider>
    </Router>
  );
}
