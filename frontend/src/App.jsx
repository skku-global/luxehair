import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CurrencyProvider } from './context/CurrencyContext';
import { CartProvider } from './context/CartContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ScrollToTop from './components/ScrollToTop';
import ProtectedRoute from './components/ProtectedRoute';

// Pages — lazy-loaded so each route ships as its own small chunk.
// The homepage no longer has to download the checkout, account and
// admin code before it can paint, which cuts the initial bundle sharply.
const HomePage = lazy(() => import('./pages/HomePage'));
const CatalogPage = lazy(() => import('./pages/CatalogPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/CartPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderConfirmationPage = lazy(() => import('./pages/OrderConfirmationPage'));
const AccountPage = lazy(() => import('./pages/AccountPage'));
const AdminDashboardPage = lazy(() => import('./pages/AdminDashboardPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

// Lightweight branded fallback shown while a route chunk loads.
function RouteLoader() {
  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--gold-primary)'
    }}>
      <span style={{
        fontSize: '28px',
        animation: 'luxe-pulse 1.2s ease-in-out infinite'
      }}>✦</span>
      <style>{`@keyframes luxe-pulse{0%,100%{opacity:.3;transform:scale(.9)}50%{opacity:1;transform:scale(1.05)}}`}</style>
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <CurrencyProvider>
        <AuthProvider>
          <CartProvider>
            <ScrollToTop />
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh',
                backgroundColor: 'var(--bg-main)',
                color: 'var(--text-primary)'
              }}
            >
              <Navbar />
              <CartDrawer />

              <main style={{ flex: 1 }}>
                <Suspense fallback={<RouteLoader />}>
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
                    <Route path="*" element={<NotFoundPage />} />
                  </Routes>
                </Suspense>
              </main>

              <Footer />
            </div>
          </CartProvider>
        </AuthProvider>
      </CurrencyProvider>
    </Router>
  );
}
