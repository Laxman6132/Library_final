import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserDashboard from './pages/UserDashboard';
import BookDetailPage from './pages/BookDetailPage';
import IssuedBooksPage from './pages/IssuedBooksPage';
import FavouritesPage from './pages/FavouritesPage';
import WaitingListPage from './pages/WaitingListPage';
import ProfilePage from './pages/ProfilePage';
import LibrarianDashboard from './pages/LibrarianDashboard';
import AdminDashboard from './pages/AdminDashboard';
import HomePage from './pages/HomePage';

/** Redirects to home page for all authenticated users */
function DefaultRedirect() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  return <Navigate to="/home" replace />;
}

function AppLayout() {
  const { auth } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 992);
  const showSidebar = !!auth;

  const location = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <div style={{ display: 'flex', minHeight: '100vh', flexDirection: 'column' }}>
      {!isAuthRoute && <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />}
      {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <div style={{
           marginLeft: (!isAuthRoute && showSidebar && sidebarOpen && window.innerWidth >= 992) ? 260 : 0, 
           transition: 'margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
           flexGrow: 1,
           padding: !isAuthRoute ? '2rem' : '0' 
      }}>
      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Common Authenticated Routes */}
        <Route path="/home"         element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

        {/* User */}
        <Route path="/dashboard"    element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/books/:id"    element={<ProtectedRoute><BookDetailPage /></ProtectedRoute>} />
        <Route path="/issued"       element={<ProtectedRoute><IssuedBooksPage /></ProtectedRoute>} />
        <Route path="/favourites"   element={<ProtectedRoute><FavouritesPage /></ProtectedRoute>} />
        <Route path="/waiting-list" element={<ProtectedRoute><WaitingListPage /></ProtectedRoute>} />

        {/* Librarian */}
        <Route path="/librarian" element={
          <ProtectedRoute requiredRole="LIBRARIAN"><LibrarianDashboard /></ProtectedRoute>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <ProtectedRoute requiredRole="ADMIN"><AdminDashboard /></ProtectedRoute>
        } />

        {/* Default redirect based on role */}
        <Route path="/"  element={<DefaultRedirect />} />
        <Route path="*"  element={<Navigate to="/" replace />} />
      </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppLayout />
      </AuthProvider>
    </BrowserRouter>
  );
}
