import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ToastProvider } from './components/ui/Toast';

import { PublicLayout } from './layouts/PublicLayout';
import { DashboardLayout } from './layouts/DashboardLayout';
import { AdminLayout } from './layouts/AdminLayout';

import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminRoute } from './components/AdminRoute';
import { GuestOnlyRoute } from './components/GuestOnlyRoute';

import Home from './pages/public/Home';
import Hotels from './pages/public/Hotels';
import RoomDetails from './pages/public/RoomDetails';
import Search from './pages/public/Search';
import Offers from './pages/public/Offers';
import Login from './pages/public/Login';
import Register from './pages/public/Register';

import Dashboard from './pages/user/Dashboard';
import MyBookings from './pages/user/MyBookings';
import BookingDetails from './pages/user/BookingDetails';
import Favorites from './pages/user/Favorites';
import Profile from './pages/user/Profile';
import Notifications from './pages/user/Notifications';
import Settings from './pages/user/Settings';

import Checkout from './pages/booking/Checkout';
import BookingSuccess from './pages/booking/BookingSuccess';

import AdminDashboard from './pages/admin/AdminDashboard';
import RoomsManagement from './pages/admin/RoomsManagement';
import BookingManagement from './pages/admin/BookingManagement';
import ReviewsModeration from './pages/admin/ReviewsModeration';
import OffersManagement from './pages/admin/OffersManagement';
import Analytics from './pages/admin/Analytics';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider />
        <Routes>
                    <Route element={<PublicLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/hotels" element={<Hotels />} />
            <Route path="/rooms/:id" element={<RoomDetails />} />
            <Route path="/search" element={<Search />} />
            <Route path="/offers" element={<Offers />} />
          </Route>

                    <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
          <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />

                    <Route path="/booking/success" element={
            <ProtectedRoute><BookingSuccess /></ProtectedRoute>
          } />

                    <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/dashboard/bookings" element={<MyBookings />} />
            <Route path="/bookings/:id" element={<BookingDetails />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
          </Route>

                    <Route element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/rooms" element={<RoomsManagement />} />
            <Route path="/admin/bookings" element={<BookingManagement />} />
            <Route path="/admin/reviews" element={<ReviewsModeration />} />
            <Route path="/admin/offers" element={<OffersManagement />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/users" element={<Navigate to="/admin" replace />} />
          </Route>

                    <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
