import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Public pages
import Home from './pages/Home';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RestaurantList from './pages/RestaurantList';
import RestaurantDetail from './pages/RestaurantDetail';
import NotificationsPage from './pages/NotificationsPage';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import CustomerOrders from './pages/customer/CustomerOrders';
import CustomerOrderDetail from './pages/customer/CustomerOrderDetail';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorRestaurant from './pages/vendor/VendorRestaurant';
import VendorMenu from './pages/vendor/VendorMenu';
import VendorOrders from './pages/vendor/VendorOrders';

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrders from './pages/delivery/DeliveryOrders';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminOrders from './pages/admin/AdminOrders';
import AdminVendors from './pages/admin/AdminVendors';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/restaurants" element={<RestaurantList />} />
              <Route path="/restaurants/:id" element={<RestaurantDetail />} />

              {/* Notifications - any authenticated user */}
              <Route element={<ProtectedRoute />}>
                <Route path="/notifications" element={<NotificationsPage />} />
              </Route>

              {/* Customer routes */}
              <Route path="/customer" element={<ProtectedRoute role="customer" />}>
                <Route path="dashboard" element={<CustomerDashboard />} />
                <Route path="orders" element={<CustomerOrders />} />
                <Route path="orders/:id" element={<CustomerOrderDetail />} />
              </Route>

              {/* Vendor routes */}
              <Route path="/vendor" element={<ProtectedRoute role="vendor" />}>
                <Route path="dashboard" element={<VendorDashboard />} />
                <Route path="restaurant" element={<VendorRestaurant />} />
                <Route path="menu" element={<VendorMenu />} />
                <Route path="orders" element={<VendorOrders />} />
              </Route>

              {/* Delivery partner routes */}
              <Route path="/delivery" element={<ProtectedRoute role="delivery_partner" />}>
                <Route path="dashboard" element={<DeliveryDashboard />} />
                <Route path="orders" element={<DeliveryOrders />} />
              </Route>

              {/* Admin routes */}
              <Route path="/admin" element={<ProtectedRoute role="admin" />}>
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<AdminUsers />} />
                <Route path="orders" element={<AdminOrders />} />
                <Route path="vendors" element={<AdminVendors />} />
              </Route>
            </Routes>
          </main>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
