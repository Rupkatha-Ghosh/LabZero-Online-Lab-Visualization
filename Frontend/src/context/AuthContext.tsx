import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { User, UserRole } from '../types/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api';

interface AuthContextType {
  user: User | null;
  login: (email: string, password?: string) => Promise<void>;
  signup: (firstName: string, lastName: string, username: string, email: string, password?: string, role?: UserRole) => Promise<void>;
  googleLogin: (role?: string) => void;
  handleGoogleCallback: () => Promise<boolean>;
  logout: () => void;
  isLoading: boolean;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('labzero_token');
      if (token) {
        try {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const response = await axios.get(`${API_URL}/auth/me/`);
          setUser(response.data);
        } catch (err) {
          console.error("Token verification failed:", err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const clearError = () => setError(null);

  const login = async (email: string, password?: string) => {
    setError(null);
    try {
      const response = await axios.post(`${API_URL}/auth/login/`, {
        email: email, 
        password
      });
      const { access } = response.data;
      localStorage.setItem('labzero_token', access);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access}`;
      
      const userResponse = await axios.get(`${API_URL}/auth/me/`);
      setUser(userResponse.data);
    } catch (err: any) {
      console.error("Login error:", err);
      setError(err.response?.data?.detail || err.message || "Login failed");
      throw err;
    }
  };

  const signup = async (firstName: string, lastName: string, username: string, email: string, password?: string, role: UserRole = 'student') => {
    setError(null);
    try {
      await axios.post(`${API_URL}/auth/register/`, {
        username,
        email,
        password,
        role,
        first_name: firstName,
        last_name: lastName
      });
      await login(email, password);
    } catch (err: any) {
      console.error("Signup error:", err);
      setError(err.response?.data?.detail || err.message || "Signup failed");
      throw err;
    }
  };

  const googleLogin = (role?: string) => {
    setError(null);
    // Redirect to backend Google OAuth endpoint with the selected role
    const roleParam = role ? `?role=${role}` : '';
    window.location.href = `${API_URL}/auth/google/login/${roleParam}`;
  };

  const handleGoogleCallback = async (): Promise<boolean> => {
    // Check URL for google_token or auth_error
    const params = new URLSearchParams(window.location.search);
    const token = params.get('google_token');
    const authError = params.get('auth_error');

    if (authError) {
      window.history.replaceState({}, document.title, window.location.pathname);
      const msg = authError === 'account_not_found' 
        ? 'Account not found. Please pick a role and Sign Up first.' 
        : `Authentication failed: ${authError}`;
      setError(msg);
      return false;
    }

    if (!token) return false;

    // Clean the URL
    window.history.replaceState({}, document.title, window.location.pathname);

    // Store token and fetch user — same as normal login
    localStorage.setItem('labzero_token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const response = await axios.get(`${API_URL}/auth/me/`);
      setUser(response.data);
      return true;
    } catch (err: any) {
      console.error("Google auth token verification failed:", err);
      localStorage.removeItem('labzero_token');
      delete axios.defaults.headers.common['Authorization'];
      setError("Session verification failed.");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('labzero_token');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      signup, 
      googleLogin, 
      handleGoogleCallback, 
      logout, 
      isLoading,
      error,
      clearError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
