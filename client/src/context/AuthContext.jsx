import { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('lead_manager_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('lead_manager_token') || null);
  const [loading, setLoading] = useState(true);

  // Verify token on initial app load
  useEffect(() => {
    const verifyAuth = async () => {
      const savedToken = localStorage.getItem('lead_manager_token');
      if (savedToken) {
        try {
          const data = await authService.getMe();
          if (data.success && data.user) {
            setUser(data.user);
            localStorage.setItem('lead_manager_user', JSON.stringify(data.user));
          }
        } catch {
          // Token is invalid or expired
          logout();
        }
      }
      setLoading(false);
    };

    verifyAuth();
  }, []);

  const login = async (credentials) => {
    const data = await authService.login(credentials);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('lead_manager_token', data.token);
      localStorage.setItem('lead_manager_user', JSON.stringify(data.user));
    }
    return data;
  };

  const register = async (userData) => {
    const data = await authService.register(userData);
    if (data.success && data.token) {
      setToken(data.token);
      setUser(data.user);
      localStorage.setItem('lead_manager_token', data.token);
      localStorage.setItem('lead_manager_user', JSON.stringify(data.user));
    }
    return data;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('lead_manager_token');
    localStorage.removeItem('lead_manager_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!token,
        loading,
        login,
        register,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
