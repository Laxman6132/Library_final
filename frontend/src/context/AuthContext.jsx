import { createContext, useContext, useState, useEffect } from 'react';
import { getUserById } from '../services/api';

const AuthContext = createContext(null);

// Normalize role: strips 'ROLE_' prefix and uppercases
// Handles 'Admin', 'admin', 'ROLE_ADMIN', 'ADMIN' → always 'ADMIN'
export const normalizeRole = (role) => {
  if (!role) return null;
  const upper = String(role).toUpperCase().trim();
  return upper.startsWith('ROLE_') ? upper.slice(5) : upper;
};

export function AuthProvider({ children }) {
  const [auth, setAuth] = useState(() => {
    try {
      const token = localStorage.getItem('token');
      const rawRole = localStorage.getItem('role');
      const userId = localStorage.getItem('userId');
      if (!token || !userId) return null;
      const role = normalizeRole(rawRole);
      return { token, role, userId: parseInt(userId, 10) };
    } catch {
      return null;
    }
  });

  const [userProfile, setUserProfile] = useState(null);
  const [profileError, setProfileError] = useState(null);

  const refreshProfile = () => {
    if (!auth?.userId || isNaN(auth.userId)) {
      setUserProfile(null);
      setProfileError('Invalid session');
      return Promise.resolve();
    }
    return getUserById(auth.userId)
      .then((res) => {
        setUserProfile(res.data);
        setProfileError(null);
      })
      .catch((err) => {
        console.error('Failed to fetch user profile:', err);
        setUserProfile(null);
        setProfileError('Failed to fetch profile');
      });
  };

  // Run refreshProfile once when userId is available
  useEffect(() => {
    if (auth?.userId) {
      refreshProfile();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auth?.userId]);

  const loginUser = ({ token, role, userId }) => {
    const normalized = normalizeRole(role);
    localStorage.setItem('token', token);
    localStorage.setItem('role', normalized);
    localStorage.setItem('userId', String(userId));
    setAuth({ token, role: normalized, userId: parseInt(String(userId), 10) });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('userId');
    setAuth(null);
    setUserProfile(null);
    setProfileError(null);
  };

  // Always compare against normalized role
  const isAdmin     = () => auth?.role === 'ADMIN';
  const isLibrarian = () => auth?.role === 'LIBRARIAN' || auth?.role === 'ADMIN';
  const isUser      = () => !!auth;

  return (
    <AuthContext.Provider value={{
      auth, userProfile, profileError,
      loginUser, logout,
      isAdmin, isLibrarian, isUser,
      refreshProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
