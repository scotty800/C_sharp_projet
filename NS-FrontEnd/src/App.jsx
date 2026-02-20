import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import MobileNav from './components/layout/MobileNav';

// Pages
import Home from './pages/Home';
import ShopList from './pages/ShopList';
import ShopDetail from './pages/ShopDetail';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import OrderConfirmation from './pages/OrderConfirmation';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Register from './pages/Register';
import CreateShop from './pages/CreateShop';
import Dashboard from './pages/Dashboard';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import NotFound from './pages/NotFound';

// Vendor Pages
import ShopDashboard from './pages/vendor/ShopDashboard';
import EditShop from './pages/EditShop';
import CreateProduct from './pages/vendor/CreateProduct';
import EditProduct from './pages/vendor/EditProduct';
import VendorOrders from './pages/vendor/VendorOrders';
import MyShops from './pages/MyShops';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminShops from './pages/admin/AdminShops';

// Styles
import './styles/globals.css';
import './App.css';

function App() {
  return (
    <Router>
      <AuthProvider>
        <CartProvider>
          <div className="app">
            <Header />
            <MobileNav />
            
            <main className="main-content">
              <Routes>
                {/* ========== PUBLIC ROUTES ========== */}
                <Route path="/" element={<Home />} />
                <Route path="/shops" element={<ShopList />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/category/:category" element={<CategoryPage />} />
                <Route path="/search" element={<SearchResults />} />
                
                {/* ========== ROUTES SPÉCIFIQUES ========== */}
                <Route path="/shops/my-shops" element={
                  <ProtectedRoute>
                    <MyShops />
                  </ProtectedRoute>
                } />
                
                <Route path="/shops/create" element={
                  <ProtectedRoute>
                    <CreateShop />
                  </ProtectedRoute>
                } />
                
                <Route path="/shops/:slug" element={<ShopDetail />} />
                
                {/* ========== AUTH ROUTES ========== */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                
                {/* ========== PROTECTED ROUTES ========== */}
                <Route path="/checkout" element={
                  <ProtectedRoute>
                    <Checkout />
                  </ProtectedRoute>
                } />
                
                <Route path="/order-confirmation" element={
                  <ProtectedRoute>
                    <OrderConfirmation />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders" element={
                  <ProtectedRoute>
                    <Orders />
                  </ProtectedRoute>
                } />
                
                <Route path="/orders/:id" element={
                  <ProtectedRoute>
                    <OrderDetail />
                  </ProtectedRoute>
                } />
                
                <Route path="/profile" element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                } />
                
                <Route path="/create-shop" element={
                  <ProtectedRoute>
                    <CreateShop />
                  </ProtectedRoute>
                } />
                
                {/* ========== VENDOR ROUTES (protégées mais sans requireVendor) ========== */}
                <Route path="/dashboard" element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/shops/:id" element={
                  <ProtectedRoute>
                    <ShopDashboard />
                  </ProtectedRoute>
                } />

                <Route path="/edit-shop/:id" element={
                  <ProtectedRoute>
                    <EditShop />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/products/new" element={
                  <ProtectedRoute>
                    <CreateProduct />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/products/:id/edit" element={
                  <ProtectedRoute>
                    <EditProduct />
                  </ProtectedRoute>
                } />
                
                <Route path="/dashboard/orders" element={
                  <ProtectedRoute>
                    <VendorOrders />
                  </ProtectedRoute>
                } />
                
                {/* ========== ADMIN ROUTES ========== */}
                <Route path="/admin" element={
                  <ProtectedRoute requireAdmin>
                    <AdminDashboard />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/users" element={
                  <ProtectedRoute requireAdmin>
                    <AdminUsers />
                  </ProtectedRoute>
                } />
                
                <Route path="/admin/shops" element={
                  <ProtectedRoute requireAdmin>
                    <AdminShops />
                  </ProtectedRoute>
                } />
                
                {/* ========== 404 ========== */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </main>
            
            <Footer />
          </div>
        </CartProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;