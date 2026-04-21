import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState } from 'react';
import { AuthProvider, useAuth, normalizeRole } from './context/AuthContext';
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

/** Redirects to the correct dashboard based on normalized role */
function DefaultRedirect() {
  const { auth } = useAuth();
  if (!auth) return <Navigate to="/login" replace />;
  const role = normalizeRole(auth.role);
  if (role === 'ADMIN')     return <Navigate to="/admin"     replace />;
  if (role === 'LIBRARIAN') return <Navigate to="/librarian" replace />;
  return <Navigate to="/dashboard" replace />;
}

function AppLayout() {
  const { auth, isLibrarian, isAdmin } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const showSidebar = auth && (isLibrarian() || isAdmin());

  const location = useLocation();
  const isAuthRoute = ['/login', '/register'].includes(location.pathname);

  return (
    <>
      {!isAuthRoute && <Navbar onToggleSidebar={() => setSidebarOpen(o => !o)} />}
      {showSidebar && <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />}

      <Routes>
        {/* Public */}
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* User */}
        <Route path="/dashboard"    element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/profile"      element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
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
    </>
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
