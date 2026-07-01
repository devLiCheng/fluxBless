import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import AdminLayout from './components/AdminLayout';
import Dashboard from './pages/Dashboard';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import SystemLogs from './pages/SystemLogs';
import Users from './pages/Users';
import LoginLogs from './pages/LoginLogs';
import Inquiries from './pages/Inquiries';
import Settings from './pages/Settings';
import BlogPosts from './pages/BlogPosts';
import Coupons from './pages/Coupons';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('fluxbless_admin_token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="products" element={<Products />} />
          <Route path="categories" element={<Categories />} />
          <Route path="orders" element={<Orders />} />
          <Route path="users" element={<Users />} />
          <Route path="inquiries" element={<Inquiries />} />
          <Route path="login-logs" element={<LoginLogs />} />
          <Route path="settings" element={<Settings />} />
          <Route path="blog-posts" element={<BlogPosts />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="logs" element={<SystemLogs />} />
          <Route path="" element={<Navigate to="dashboard" replace />} />
        </Route>
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};
